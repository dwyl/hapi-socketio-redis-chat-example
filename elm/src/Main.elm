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
    {}


init : ( Model, Cmd Msg )
init =
    ( Model, Cmd.none )


type Msg
    = Hello String


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        Hello string ->
            ( Model, Cmd.none )


view : Model -> Html Msg
view model =
    div []
        [ ul [] [ li [] [ text "chat messages go here" ] ]
        , Html.form []
            [ input [] []
            , button [] [ text "Send" ]
            ]
        ]
