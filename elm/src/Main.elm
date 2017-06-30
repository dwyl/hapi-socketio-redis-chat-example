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


type alias Message =
    { n : String
    , t : Time
    , m : String
    }


type alias MessageInput =
    { input : String
    , placeholder : String
    }


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
    | GetMessageHistory
    | Fail
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
            ( { model | messages = List.concat [ model.messages, [ parseMessageJson messageJson ] ] }, scrollToBottom )

        NewNameFromPort name ->
            ( { model | messages = List.concat [ model.messages, [ Message "" -1 (name ++ " joined the room") ] ] }, scrollToBottom )

        DisplayMessageHistory messageListJson ->
            ( { model | messages = parseMessageListJson messageListJson }, scrollToBottom )

        GetMessageHistory ->
            ( model, fetchMessageHistory )

        Fail ->
            ( { model | name = "I AM ERROR" }, Cmd.none )

        ShowErrorMessage message ->
            ( { model | messages = List.concat [ model.messages, [ message ] ] }, scrollToBottom )

        NoOp ->
            ( model, Cmd.none )


view : Model -> Html Msg
view model =
    case model.name of
        "" ->
            login model

        _ ->
            chat model


chat : Model -> Html Msg
chat model =
    div [ class "helvetica" ]
        [ ul [ class "list w-100 pt0 pl0 pr0 pb5rem ma0" ] (List.map parseMessage model.messages)
        , Html.form [ class "bg-near-black h3_5 w-100 bw2 fixed bottom-0 pt2", onSubmit (validateMessage model) ]
            [ input [ class "fixed bottom-1 left-1 ba0 f3 pv2 border-box", HA.style [ ( "width", toString (model.windowWidth - 148) ++ "px" ) ], HA.value model.messageInput.input, HA.placeholder model.messageInput.placeholder, onInput UpdateInput ] []
            , button [ class "fixed bottom-1 right-1 fr ba0 ph1 f3 pv2 white border-box", HA.style [ ( "width", "103px" ), ( "background-color", "#4DB6AC" ), ( "border-color", "#4DB6AC" ) ] ] [ text "Send" ]
            ]
        ]


validateMessage : Model -> Msg
validateMessage model =
    case model.messageInput.input of
        "" ->
            InvalidMessage

        _ ->
            SendMessage


login : Model -> Html Msg
login model =
    Html.form [ class "pa4 black-80", onSubmit SetName ]
        [ div [ class "measure" ]
            [ label [ class "f6 b db mb2", for "name" ]
                [ text "Name" ]
            , input [ attribute "aria-describedby" "name-desc", class "input-reset ba b--black-20 pa2 mb2 db w-100", id "name", type_ "text", HA.value model.nameInput, onInput UpdateNameInput ]
                []
            , small [ class "f6 black-60 db mb2", id "name-desc" ]
                [ text "Helper text for the form control." ]
            ]
        ]


parseTimestamp : Time -> String
parseTimestamp time =
    Date.fromTime time
        |> Date.Extra.toFormattedString "d/M/y HH:mm"


parseMessage : Message -> Html Msg
parseMessage message =
    let
        time =
            if message.t == 0 then
                "Error: "
            else
                parseTimestamp message.t
    in
    if message.t == -1 then
        li [ class "pv3 ph3 animation" ]
            [ span [ class "blue mh1 f6 f5-m f4-l" ] [ text message.m ]
            ]
    else if message.n == "" then
        li [ class "pv3 ph3 animation" ]
            [ span [ class "light-silver f6 f5-m f4-l" ] [ text time ]
            , span [ class "blue mh1 f6 f5-m f4-l" ] [ text message.m ]
            ]
    else
        li [ class "pv3 ph3 bg-white" ]
            [ span [ class "light-silver f6 f5-m f4-l" ] [ text time ]
            , span [ class "blue mh1 f6 f5-m f4-l" ] [ text message.n ]
            , p [ class "mv1 f5 f4-m f3-l" ] [ text message.m ]
            ]


fetchMessageHistory : Cmd Msg
fetchMessageHistory =
    Task.attempt handleFetch (Http.toTask (Http.get "/load" decodeListOfMessages))



--How to test this? create our own result? help wanted


handleFetch : Result error (List String) -> Msg
handleFetch result =
    case result of
        Ok result ->
            DisplayMessageHistory result

        Err _ ->
            Fail


decodeListOfMessages : Decoder (List String)
decodeListOfMessages =
    Json.Decode.list Json.Decode.string


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


scrollToBottom : Cmd Msg
scrollToBottom =
    Task.attempt (always NoOp) (Dom.Scroll.toBottom "container")


subscriptions : a -> Sub Msg
subscriptions model =
    Sub.batch
        [ Window.resizes (\{ height, width } -> Resize width)
        , message handleMessage --NewMessageFromPort
        , name NewNameFromPort
        ]


handleMessage : Json.Encode.Value -> Msg
handleMessage message =
    let
        result =
            Json.Decode.decodeValue Json.Decode.string message
    in
    case result of
        Ok string ->
            NewMessageFromPort string

        Err _ ->
            ShowErrorMessage (Message "" 0 "unable to parse message")


port setName : String -> Cmd msg


port sendMessage : String -> Cmd msg


port message : (Json.Encode.Value -> msg) -> Sub msg


port name : (String -> msg) -> Sub msg
