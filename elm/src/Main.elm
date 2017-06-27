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
  { name: String
  , messages: List Message
  , messageInput: MessageInput
  }

type alias Message =
  { author: String
  , time: String
  , message: String
  }

type alias MessageInput =
  { input: String
  , placeholder: String
  }

init : ( Model, Cmd Msg )
init =
    ( Model "" [] (MessageInput "" "") , Cmd.none )


type Msg
    = UpdateInput String


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        UpdateInput message ->
            ( { model | messageInput = MessageInput message ""}, Cmd.none)


view : Model -> Html Msg
view model =
    div []
        [ ul [] [ li [] [ text "chat messages go here" ] ]
        , Html.form [ ]
            [ input [ value model.messageInput.input, Html.Attributes.placeholder model.messageInput.placeholder, onInput UpdateInput ] []
            , button [] [ text "Send" ]
            ]
        ]
