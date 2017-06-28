port module Main exposing (..)

import Html exposing (..)
import Html.Attributes as HA exposing (..)
import Html.Events exposing (..)
import Task exposing (..)
import Window exposing (..)
import Json.Decode exposing (..)
import Json.Decode.Pipeline as JPipe exposing (..)

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
    , t : Int
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
            ( Model name [ Message "god" 2321 "it was good", Message "" 2321 "jesus has joined the room", Message "Satan" 0000000 "Welcome to Sheol", Message "god" 2321 "it was good", Message "" 2321 "jesus has joined the room", Message "Satan" 0000000 "Welcome to Sheol" ] (MessageInput "" "") "" 0, Task.perform Resize Window.width )

        Nothing ->
            ( Model "" [ Message "god" 2321 "it was good", Message "" 2321 "jesus has joined the room", Message "Satan" 0000000 "Welcome to Sheol" ] (MessageInput "" "") "" 0, Task.perform Resize Window.width )


type Msg
    = UpdateInput String
    | UpdateNameInput String
    | Resize Int
    | SetName
    | SendMessage
    | NewMessageFromPort String


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

        NewMessageFromPort json ->
            let
              newMessage = Json.Decode.decodeString decodeMessage json
            in
            ( { model | messages = (List.concat [model.messages, [ Result.withDefault (Message "" 0 "I am error") newMessage ]]) }, Cmd.none)


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
        , Html.form [ class "bg-near-black h3_5 w-100 bw2 fixed bottom-0 pt2", onSubmit SendMessage ]
            [ input [ class "fixed bottom-1 left-1 ba0 f3 pv2 border-box", HA.style [ ( "width", toString (model.windowWidth - 148) ++ "px" ) ], HA.value model.messageInput.input, HA.placeholder model.messageInput.placeholder, onInput UpdateInput ] []
            , button [ class "fixed bottom-1 right-1 fr ba0 ph1 f3 pv2 white border-box", HA.style [ ( "width", "103px" ), ( "background-color", "#4DB6AC" ), ( "border-color", "#4DB6AC" ) ] ] [ text "Send" ]
            ]
        ]


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


parseMessage : Message -> Html Msg
parseMessage message =
    if message.n == "" then
      let
        time =
          if message.t == 0 then
            "Error: "
          else
            toString message.t
      in
        li [ class "pv3 ph3 animation" ]
            [ span [ class "gray f6 f5-m f4-l" ] [ text time ]
            , span [ class "blue mh1 f6 f5-m f4-l" ] [ text message.m ]
            ]
    else
        li [ class "pv3 ph3 bg-white" ]
            [ span [ class "gray f6 f5-m f4-l" ] [ text (toString message.t) ]
            , span [ class "blue mh1 f6 f5-m f4-l" ] [ text message.n ]
            , p [ class "mv1 f5 f4-m f3-l" ] [ text message.m ]
            ]

decodeMessage : Decoder Message
decodeMessage =
  decode Message
    |> JPipe.required "n" string
    |> JPipe.required "t" int
    |> JPipe.required "m" string


subscriptions model =
    Sub.batch [
    Window.resizes (\{ height, width } -> Resize width)
    , message NewMessageFromPort
    ]


port setName : String -> Cmd msg
port sendMessage : String -> Cmd msg
port message : (String -> msg) -> Sub msg
