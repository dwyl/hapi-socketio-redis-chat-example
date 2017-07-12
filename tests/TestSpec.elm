module TestSpec exposing (..)

import Expect
import Html exposing (..)
import Html.Attributes exposing (..)
import Json.Decode exposing (..)
import Json.Encode exposing (..)
import Main exposing (..)
import Test exposing (..)


suite : Test
suite =
    describe "Testing everything"
        [ describe "Tests parseTimestamp"
            [ test "spits out the correct date from a Time (float)" <|
                \() ->
                    let
                        result =
                            Main.parseTimestamp 1498745974136

                        expected =
                            "29/6/2017 15:19"
                    in
                    Expect.equal result expected
            ]
        , describe "Tests parseMessage"
            [ test "tests parseMessage formats normal chat messages correctly" <|
                \() ->
                    let
                        message =
                            Main.Message "Finn" 1498745974136 "Hello"

                        expected =
                            li [ class "pv3 ph3 bg-white" ]
                                [ span [ class "light-silver f6 f5-m f4-l" ] [ text "29/6/2017 15:19" ]
                                , span [ class "blue mh1 f6 f5-m f4-l" ] [ text "Finn" ]
                                , p [ class "mv1 f5 f4-m f3-l" ] [ text "Hello" ]
                                ]
                    in
                    Expect.equal (Main.parseMessage message) expected
            , test "tests parseMessage formats user join message correctly" <|
                \() ->
                    let
                        message =
                            Main.Message "" -1 "Hello jointime"

                        expected =
                            li [ class "pv3 ph3 animation" ]
                                [ span [ class "blue mh1 f6 f5-m f4-l" ] [ text "Hello jointime" ]
                                ]
                    in
                    Expect.equal (Main.parseMessage message) expected
            , test "tests parseMessage displays errors nicely" <|
                \() ->
                    let
                        message =
                            Main.Message "" 0 "problem"

                        expected =
                            li [ class "pv3 ph3 animation" ]
                                [ span [ class "light-silver f6 f5-m f4-l" ] [ text "Error: " ]
                                , span [ class "blue mh1 f6 f5-m f4-l" ] [ text "problem" ]
                                ]
                    in
                    Expect.equal (Main.parseMessage message) expected
            ]
        , describe "Testing view"
            [ test "View calls login when name is empty" <|
                \() ->
                    let
                        model =
                            Main.Model "" [] (MessageInput "" "") "" 0
                    in
                    Expect.equal (Main.view model) (Main.login model)
            , test "View calls chat view when name exists" <|
                \() ->
                    let
                        model =
                            Main.Model "name" [] (MessageInput "" "") "" 0
                    in
                    Expect.equal (Main.view model) (Main.chat model)
            ]
        , describe "testing parseMessageJson"
            --parseMessageJson can only ever take a string because Elm, so we use 'handleMessage' to deal with non-string data types before they are passed to parseMessageJson
            [ test "parseMessageJson works with correct input" <|
                \() ->
                    let
                        undecoded =
                            "{\"m\":\"yolo\",\"n\":\"bear\",\"t\":1993}"

                        decoded =
                            Main.Message "bear" 1993 "yolo"
                    in
                    Expect.equal (Main.parseMessageJson undecoded) decoded
            , test "parseMessageJson errors with wrong types in source object" <|
                \() ->
                    let
                        undecoded =
                            "{\"m\":\"yolo\",\"n\":\"bear\",\"t\":\"1993\"}"

                        decoded =
                            Main.Message "" 0 "unable to parse message"
                    in
                    Expect.equal (Main.parseMessageJson undecoded) decoded
            , test "parseMessageJson errors with a string (not json)" <|
                \() ->
                    let
                        undecoded =
                            "HELLO"

                        decoded =
                            Main.Message "" 0 "unable to parse message"
                    in
                    Expect.equal (Main.parseMessageJson undecoded) decoded
            ]
        , describe "tests handleMessage"
            [ test "handleMessage works with a string (error handling is passed to parseMessageJson)" <|
                \() ->
                    let
                        undecoded =
                            Json.Encode.string "{\"m\":\"yolo\",\"n\":\"bear\",\"t\":1993}"

                        decoded =
                            "{\"m\":\"yolo\",\"n\":\"bear\",\"t\":1993}"
                    in
                    Expect.equal (Main.handleMessage undecoded) (NewMessageFromPort decoded)
            , test "handleMessage errors with an int" <|
                \() ->
                    let
                        undecoded =
                            Json.Encode.int 123

                        decoded =
                            ShowErrorMessage (Message "" 0 "unable to parse message")
                    in
                    Expect.equal (Main.handleMessage undecoded) decoded
            ]
        , describe "tests handleName"
            [ test "handleName works with a string" <|
                \() ->
                    let
                        undecoded =
                            Json.Encode.string "Hello"
                    in
                    Expect.equal (Main.handleName undecoded) (NewNameFromPort "Hello")
            , test "handleMessage errors with an int" <|
                \() ->
                    let
                        undecoded =
                            Json.Encode.int 123

                        result =
                            ShowErrorMessage (Message "" 0 "an unknown user joined the chat")
                    in
                    Expect.equal (Main.handleName undecoded) result
            ]
        ]
