module Main exposing (..)

import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Task exposing (..)
import Window exposing (..)


main =
    Html.program
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }


type alias Model =
    { name : String
    , messages : List Message
    , messageInput : MessageInput
    , windowWidth : Int
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
    ( Model "" [ Message "god" "15:30:00" "it was good", Message "belezebub" "15:30:00" "the left hand path reaps dark rewards", Message "god" "15:30:00" "it was good", Message "belezebub" "15:30:00" "the left hand path reaps dark rewards", Message "god" "15:30:00" "it was good", Message "belezebub" "15:30:00" "the left hand path reaps dark rewards", Message "god" "15:30:00" "it was good", Message "belezebub" "15:30:00" "the left hand path reaps dark rewards", Message "god" "15:30:00" "it was good", Message "belezebub" "15:30:00" "the left hand path reaps dark rewards", Message "god" "15:30:00" "it was good", Message "belezebub" "15:30:00" "the left hand path reaps dark rewards", Message "god" "15:30:00" "it was good", Message "belezebub" "15:30:00" "the left hand path reaps dark rewards", Message "god" "15:30:00" "it was good", Message "belezebub" "15:30:00" "the left hand path reaps dark rewards" ] (MessageInput "" "") 0, Task.perform Resize Window.width )


type Msg
    = UpdateInput String
    | Resize Int


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        UpdateInput message ->
            ( { model | messageInput = MessageInput message "" }, Cmd.none )

        Resize newWidth ->
            ( { model | windowWidth = newWidth }, Cmd.none )


view : Model -> Html Msg
view model =
    div [ class "helvetica" ]
        [ ul [ class "list w-100 pt0 pl0 pr0 pb5rem ma0" ] (List.map parseMessage model.messages)
        , Html.form [ class "bg-near-black h3_5 w-100 bw2 fixed bottom-0 pt2" ]
            [ input [ class "fixed bottom-1 left-1 ba0 f3 pv2 border-box", Html.Attributes.style [ ( "width", toString (model.windowWidth - 148) ++ "px" ) ], value model.messageInput.input, Html.Attributes.placeholder model.messageInput.placeholder, onInput UpdateInput ] []
            , button [ class "fixed bottom-1 right-1 fr ba0 ph1 f3 pv2 white border-box", Html.Attributes.style [ ( "width", "103px" ), ( "background-color", "#4DB6AC" ), ( "border-color", "#4DB6AC" ) ] ] [ text "Send" ]
            ]
        ]


parseMessage : Message -> Html Msg
parseMessage message =
    li [ class "pv3 ph3 striped--light-gray" ]
        [ span [ class "gray f5" ] [ text message.time ]
        , span [ class "blue mh1 f5" ] [ text message.author ]
        , p [ class "mv1 f3" ] [ text message.message ]
        ]


subscriptions model =
    Window.resizes (\{ height, width } -> Resize width)
