module TestSpec exposing (..)

import Expect
import Main exposing (..)
import Test exposing (..)
import Html exposing (..)
import Html.Attributes exposing (..)

suite : Test
suite =
  describe "Testing everything"
    [
      describe "Tests parseTimestamp" [
        test "spits out the correct date from a Time (float)" <|
          \() ->
            let
              result = Main.parseTimestamp 1498745974136
              expected = "29/6/2017 15:19"
            in
            Expect.equal result expected
      ]
      , describe "Tests parseMessage"
        [ test "tests parseMessage formats normal chat messages correctly" <|
          \() ->
            let
              message = Main.Message "Finn" 1498745974136 "Hello"
              expected = li [ class "pv3 ph3 bg-white" ]
                [ span [ class "light-silver f6 f5-m f4-l" ] [ text "29/6/2017 15:19" ]
                , span [ class "blue mh1 f6 f5-m f4-l" ] [ text "Finn" ]
                , p [ class "mv1 f5 f4-m f3-l" ] [ text "Hello" ]
                ]
            in
            Expect.equal (Main.parseMessage message) expected
          , test "tests parseMessage formats user join message correctly" <|
            \() ->
              let
                message = Main.Message "" -1 "Hello jointime"
                expected = li [ class "pv3 ph3 animation" ]
                  [ span [ class "blue mh1 f6 f5-m f4-l" ] [ text "Hello jointime" ]
                  ]
              in
              Expect.equal (Main.parseMessage message) expected
          , test "tests parseMessage displays errors nicely" <|
            \() ->
              let
                message = Main.Message "" 0 "problem"
                expected = li [ class "pv3 ph3 animation" ]
                    [ span [ class "light-silver f6 f5-m f4-l" ] [ text "Error: " ]
                    , span [ class "blue mh1 f6 f5-m f4-l" ] [ text "problem"]
                    ]
              in
              Expect.equal (Main.parseMessage message) expected
      ]
    ]
