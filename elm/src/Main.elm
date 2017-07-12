port module Main exposing (..)

import Date exposing (..)
import Date.Extra exposing (..)
import Dom.Scroll exposing (..)
import Html exposing (..)
import Html.Attributes as HA exposing (..)
import Html.Events exposing (..)
import Http exposing (..)
import Json.Decode exposing (..)
import Json.Decode.Pipeline as JPipe exposing (..)
import Json.Encode exposing (Value)
import Task exposing (..)
import Time exposing (Time)
import Window exposing (..)


-- Maybe String because the name is initialised from localstorage (if it exists)


main : Program (Maybe String) Model Msg
main =
    Html.programWithFlags
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }


type alias Model =
    { name : String
    , messages : List Message
    , messageInput : MessageInput
    , nameInput : String
    , windowWidth : Int
    }



-- Match message types to the backend


type alias Message =
    { n : String
    , t : Time
    , m : String
    }



-- Add a placeholder to messageInput so empty message submits prompt the user


type alias MessageInput =
    { input : String
    , placeholder : String
    }



-- Take in name from localStorage (programWithFlags) if it exists and put it in model
-- Dispatch two commands:
-- Initialise the message input dynamically so it scales to 100% of the screen minus
-- the width of the button.
-- Run an http get request to fetchMessageHistory from the server (redis)


init : Maybe String -> ( Model, Cmd Msg )
init name =
    case name of
        Just name ->
            ( Model name [] (MessageInput "" "") "" 0, Cmd.batch [ Task.perform Resize Window.width, fetchMessageHistory ] )

        Nothing ->
            ( Model "" [] (MessageInput "" "") "" 0, Cmd.batch [ Task.perform Resize Window.width, fetchMessageHistory ] )


type Msg
    = UpdateInput String
    | UpdateNameInput String
    | Resize Int
    | SetName
    | SendMessage
    | InvalidMessage
    | NewMessageFromPort String
    | NewNameFromPort String
    | DisplayMessageHistory (List String)
    | ShowErrorMessage Message
    | NoOp


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        UpdateInput message ->
            ( { model | messageInput = MessageInput message "" }, Cmd.none )

        UpdateNameInput name ->
            ( { model | nameInput = name }, Cmd.none )

        Resize newWidth ->
            ( { model | windowWidth = newWidth }, Cmd.none )

        SetName ->
            ( { model | name = model.nameInput, nameInput = "" }, setName model.nameInput )

        SendMessage ->
            ( { model | messageInput = MessageInput "" "" }, sendMessage model.messageInput.input )

        InvalidMessage ->
            ( { model | messageInput = MessageInput "" "Please enter your message here" }, Cmd.none )

        NewMessageFromPort messageJson ->
            ( { model | messages = model.messages ++ [ parseMessageJson messageJson ] }, scrollToBottom )

        NewNameFromPort name ->
            ( { model | messages = model.messages ++ [ Message "" -1 (name ++ " joined the room") ] }, scrollToBottom )

        DisplayMessageHistory messageListJson ->
            ( { model | messages = parseMessageListJson messageListJson }, scrollToBottom )

        ShowErrorMessage message ->
            ( { model | messages = model.messages ++ [ message ] }, scrollToBottom )

        NoOp ->
            ( model, Cmd.none )



-- Only go to chat view when there is a name in the model (otherwise login view)


view : Model -> Html Msg
view model =
    case model.name of
        "" ->
            login model

        _ ->
            chat model


login : Model -> Html Msg
login model =
    Html.form [ class "pa4 black-80", onSubmit SetName ]
        [ div [ class "measure" ]
            [ label [ class "f6 b db mb2", for "name" ]
                [ text "Name" ]
            , input
                [ attribute "aria-describedby" "name-desc"
                , class "input-reset ba b--black-20 pa2 mb2 db w-100"
                , id "name"
                , type_ "text"
                , HA.value model.nameInput
                , onInput UpdateNameInput
                ]
                []
            , small [ class "f6 black-60 db mb2", id "name-desc" ]
                [ text "Helper text for the form control." ]
            ]
        ]


chat : Model -> Html Msg
chat model =
    div [ class "helvetica" ]
        [ ul [ class "list w-100 pt0 pl0 pr0 pb5rem ma0" ] (List.map parseMessage model.messages)
        , Html.form
            [ class "bg-near-black h3_5 w-100 bw2 fixed bottom-0 pt2"
            , onSubmit (validateMessage model)
            ]
            [ input
                [ class "fixed bottom-1 left-1 ba0 f3 pv2 border-box"
                , HA.style [ ( "width", toString (model.windowWidth - 148) ++ "px" ) ]
                , HA.value model.messageInput.input
                , HA.placeholder model.messageInput.placeholder
                , onInput UpdateInput
                ]
                []
            , button
                [ class "fixed bottom-1 right-1 fr ba0 ph1 f3 pv2 white border-box"
                , HA.style
                    [ ( "width", "103px" )
                    , ( "background-color", "#4DB6AC" )
                    , ( "border-color", "#4DB6AC" )
                    ]
                ]
                [ text "Send" ]
            ]
        ]



-- We use the t field of messages (timestamp) to parse valid messages and errors
-- -1 equals a one line messages like 'blah user has joined the chat'
-- 0 equals an error message e.g. 'cannot pass message'


parseMessage : Message -> Html Msg
parseMessage message =
    case message.t of
        (-1) ->
            li [ class "pv3 ph3 animation" ]
                [ span [ class "blue mh1 f6 f5-m f4-l" ] [ text message.m ]
                ]

        0 ->
            li [ class "pv3 ph3 animation" ]
                [ span [ class "light-silver f6 f5-m f4-l" ] [ text "Error: " ]
                , span [ class "blue mh1 f6 f5-m f4-l" ] [ text message.m ]
                ]

        _ ->
            li [ class "pv3 ph3 bg-white" ]
                [ span [ class "light-silver f6 f5-m f4-l" ] [ text (parseTimestamp message.t) ]
                , span [ class "blue mh1 f6 f5-m f4-l" ] [ text message.n ]
                , p [ class "mv1 f5 f4-m f3-l" ] [ text message.m ]
                ]



-- Use Date.Extra to translate the backend timestamp to a user friendly date


parseTimestamp : Time -> String
parseTimestamp time =
    Date.fromTime time
        |> Date.Extra.toFormattedString "d/M/y HH:mm"



-- If message is empty, don't send and add a helpful prompt as placeholder text


validateMessage : Model -> Msg
validateMessage model =
    case model.messageInput.input of
        "" ->
            InvalidMessage

        _ ->
            SendMessage



-- Add an auto-scroll to keep new messages at the bottom
-- The first argument to task.attempt is a fail action (scroll can fail because
-- it takes a DOM element id) so we call a no-operation msg.


scrollToBottom : Cmd Msg
scrollToBottom =
    Task.attempt (always NoOp) (Dom.Scroll.toBottom "container")



-- Pretty standard http request using task.attempt and http.toTask to convert
-- the get request to a nice elm task


fetchMessageHistory : Cmd Msg
fetchMessageHistory =
    Task.attempt handleFetch (Http.toTask (Http.get "/load" decodeListOfMessages))



-- Handle failed get requests


handleFetch : Result error (List String) -> Msg
handleFetch result =
    case result of
        Ok result ->
            DisplayMessageHistory result

        Err _ ->
            ShowErrorMessage (Message "" 0 "unable to fetch message history")



-- Make sure the message history comes in as a list (array) of strings (json)


decodeListOfMessages : Decoder (List String)
decodeListOfMessages =
    Json.Decode.list Json.Decode.string



-- Parse each individual message inside the message history


parseMessageListJson : List String -> List Message
parseMessageListJson json =
    let
        default =
            Message "" 0 "problem retrieving message"

        decode =
            Json.Decode.decodeString decodeMessage
    in
    List.map (\message -> Result.withDefault default (decode message)) json



-- change to take in a maybe string


parseMessageJson : String -> Message
parseMessageJson json =
    Json.Decode.decodeString decodeMessage json
        |> Result.withDefault (Message "" 0 "unable to parse message")


decodeMessage : Decoder Message
decodeMessage =
    decode Message
        |> JPipe.required "n" string
        |> JPipe.required "t" float
        |> JPipe.required "m" string



-- Stop the values (could be any type because javascript) we get through ports
-- from breaking Elm.


handleMessage : Json.Encode.Value -> Msg
handleMessage message =
    case Json.Decode.decodeValue Json.Decode.string message of
        Ok string ->
            NewMessageFromPort string

        Err _ ->
            ShowErrorMessage (Message "" 0 "unable to parse message")


handleName : Json.Encode.Value -> Msg
handleName name =
    case Json.Decode.decodeValue Json.Decode.string name of
        Ok string ->
            NewNameFromPort string

        Err _ ->
            ShowErrorMessage (Message "" 0 "an unknown user joined the chat")



-- Our subscriptions include:
-- Window.resizes to keep our message input the right width even after a resize
-- Two incoming javascript ports for new messages and new users


subscriptions : a -> Sub Msg
subscriptions model =
    Sub.batch
        [ Window.resizes (\{ height, width } -> Resize width)
        , message handleMessage
        , name handleName
        ]


port setName : String -> Cmd msg


port sendMessage : String -> Cmd msg


port message : (Json.Encode.Value -> msg) -> Sub msg


port name : (Json.Encode.Value -> msg) -> Sub msg
