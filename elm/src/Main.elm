module Main exposing (..)

import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Window exposing (..)


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
    ( Model "" [ Message "god" "15:30:00" "it was good", Message "belezebub" "15:30:00" "the left hand path reaps dark rewards" ] (MessageInput "" ""), Cmd.none )


type Msg
    = UpdateInput String


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        UpdateInput message ->
            ( { model | messageInput = MessageInput message "" }, Cmd.none )


view : Model -> Html Msg
view model =
    div [ class "helvetica"]
        [ ul [ class "list w-100 pa0 ma0" ] (List.map parseMessage model.messages)
        , Html.form [ class "bg-near-black w-100 fixed pa1 bottom-0"]
            [ input [ class "pa2 ba0 w-90", value model.messageInput.input, Html.Attributes.placeholder model.messageInput.placeholder, onInput UpdateInput ] []
            , div [ class "w-10 center dib"] [button [ class "pa2 center w-5"] [ text "Send" ]]
            ]
        ]


parseMessage : Message -> Html Msg
parseMessage message =
    li [ class "pv3 ph3 striped--light-gray"]
        [ span [ class "gray f5" ] [ text message.time ]
        , span [ class "blue mh1 f5"] [ text message.author ]
        , p [ class "mv1 f3"] [ text message.message ]
        ]
