module TestSpec exposing (..)

import Expect
import Html exposing (..)
import Html.Attributes exposing (..)
import Json.Decode exposing (..)
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
        , describe "testing decodeMessage"
            [ test "decodeMessage works with correct input" <|
                \() ->
                    let
                        undecoded =
                            "{\"m\":\"yolo\",\"n\":\"bear\",\"t\":1993}"

                        decoded =
                            Main.Message "bear" 1993 "yolo"
                    in
                    Expect.equal (Result.withDefault (Message "" 0 "") (Json.Decode.decodeString Main.decodeMessage undecoded)) decoded
            , test "decodeMessage works with wrong types in source object" <|
                \() ->
                    let
                        undecoded =
                            "{\"m\":\"yolo\",\"n\":\"bear\",\"t\":\"1993\"}"

                        decoded =
                            Main.Message "" 0 "error"
                    in
                    Expect.equal (Result.withDefault (Message "" 0 "error") (Json.Decode.decodeString Main.decodeMessage undecoded)) decoded
            ]
        ]
