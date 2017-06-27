module Main exposing (..)

import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)


main =
    Html.program
        { init = init
        , view = view
        , update = update
        , subscriptions = always Sub.none
        }


type alias Model =
    { name : String
    , messages : List Message
    , messageInput : MessageInput
    }


type alias Message =
    { author : String
    , time : String
    , message : String
    }


type alias MessageInput =
    { input : String
    , placeholder : String
    }


init : ( Model, Cmd Msg )
init =
    ( Model "" [ Message "god" "0" "it was good", Message "belezebub" "1" "the left hand path reaps dark rewards" ] (MessageInput "" ""), Cmd.none )


type Msg
    = UpdateInput String


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        UpdateInput message ->
            ( { model | messageInput = MessageInput message "" }, Cmd.none )


view : Model -> Html Msg
view model =
    div []
        [ ul [] (List.map parseMessage model.messages)
        , Html.form []
            [ input [ value model.messageInput.input, Html.Attributes.placeholder model.messageInput.placeholder, onInput UpdateInput ] []
            , button [] [ text "Send" ]
            ]
        ]


parseMessage : Message -> Html Msg
parseMessage message =
    li []
        [ span [] [ text message.time ]
        , span [] [ text message.author ]
        , p [] [ text message.message ]
        ]
