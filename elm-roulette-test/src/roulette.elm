
import Browser
import Html
import Html.Attributes
import Html.Events
import Svg
import Svg.Attributes exposing (..)
import Svg.Events
--import Debug
import Random

-- TODO more consistent naming
-- TODO add outside bets

main = Browser.element {init = init, update = update, subscriptions = subscriptions, view = view}

type alias Model = {my : Int, number : Int, money: Int, bets : List BetTypes}

-- https://en.wikipedia.org/wiki/ro#Mathematical_model
-- http://www.casinogamespro.com/roulette/european-roulette

type BetTypes = Zero | Straight Int | SplitH Int | SplitV Int | Street Int | Corner Int | SixLine Int | Column Int | Dozen Int | OddNotEven Bool | RedNotBlack Bool | Half Int | Unknown

-- TODO remove Unknown
-- TODO remove zero, or is zero a possible bet?

roPossibleBets : List BetTypes
roPossibleBets = [Zero, Straight 32, Straight 15, Straight 19, Straight 4, Straight 21, Straight 2, Straight 25, Straight 17, Straight 34, Straight 6, Straight 27, Straight 13, Straight 36, Straight 11, Straight 30, Straight 8, Straight 23, Straight 10, Straight 5, Straight 24, Straight 16, Straight 33, Straight 1, Straight 20, Straight 14, Straight 31, Straight 9, Straight 22, Straight 18, Straight 29, Straight 7, Straight 28, Straight 12, Straight 35, Straight 3, Straight 26, Street 1, Street 4, Street 7, Street 10, Street 13, Street 16, Street 19, Street 22, Street 25, Street 28, Street 31, Street 34, SixLine 1, SixLine 4, SixLine 7, SixLine 10, SixLine 13, SixLine 16, SixLine 19, SixLine 22, SixLine 25, SixLine 28, SixLine 31, Corner 1, Corner 2, Corner 4, Corner 5, Corner 7, Corner 8, Corner 10, Corner 11, Corner 13, Corner 14, Corner 16, Corner 17, Corner 19, Corner 20, Corner 22, Corner 23, Corner 25, Corner 26, Corner 28, Corner 29, Corner 31, Corner 32, SplitH 1, SplitH 2, SplitH 4, SplitH 5, SplitH 7, SplitH 8, SplitH 10, SplitH 11, SplitH 13, SplitH 14, SplitH 16, SplitH 17, SplitH 19, SplitH 20, SplitH 22, SplitH 23, SplitH 25, SplitH 26, SplitH 28, SplitH 29, SplitH 31, SplitH 32, SplitH 34, SplitH 35, SplitV 1, SplitV 2, SplitV 3, SplitV 4, SplitV 5, SplitV 6, SplitV 7, SplitV 8, SplitV 9, SplitV 10, SplitV 11, SplitV 12, SplitV 13, SplitV 14, SplitV 15, SplitV 16, SplitV 17, SplitV 18, SplitV 19, SplitV 20, SplitV 21, SplitV 22, SplitV 23, SplitV 24, SplitV 25, SplitV 26, SplitV 27, SplitV 28, SplitV 29, SplitV 30, SplitV 31, SplitV 32, SplitV 33, Column 1, Column 2, Column 3, Dozen 1, Dozen 13, Dozen 25, OddNotEven True, OddNotEven False, RedNotBlack True, RedNotBlack False, Half 1, Half 19]

init : () -> (Model, Cmd Msg)
init _ = ({my = 0, number = 0, money = 100, bets = []}, Cmd.none)

type Msg = Test | Spin | Number Int | Bet BetTypes

update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
  case msg of
    Test ->
      ({ model | my = model.my + 1}, Cmd.none)
    Spin ->
      (model, Random.generate Number (Random.int 0 36))
    Number number ->
      ({ model | number = number, money = model.money + (calcAllPayout number model.bets), bets = []}, Cmd.none)
    Bet kind ->
      ({ model | bets = kind :: model.bets, money = model.money - 1}, Cmd.none)

-- instead of write them down here is would also be possible to count up roPossibleBets - 1
winChance bet =
  case bet of
    Straight _ -> 35
    SplitH _ -> 17
    SplitV _ -> 17
    Street _ -> 11
    Corner _ -> 8
    SixLine _ -> 5
    Column _ -> 2
    Dozen _ -> 2
    OddNotEven _ -> 1
    RedNotBlack _ -> 1
    Half _ -> 1
    _ -> 0 -- TODO crash

calcSinglePayout : Int -> BetTypes -> Int
calcSinglePayout number bet =
  let
    valid = case bet of
      Straight n -> List.member number [n]
      SplitH n -> List.member number [n, n + 1]
      SplitV n -> List.member number [n, n + 3]
      Street n -> List.member number [n, n + 1, n + 2]
      Corner n -> List.member number [n, n + 1, n + 3, n + 4]
      SixLine n -> List.member number [n, n + 1, n + 2, n + 3, n + 4, n + 5]
      Column n -> False -- TODO
      Dozen n -> (number >= n) && (number <= (n + 12))
      OddNotEven b -> False -- TODO ((modBy 2 number) == 0) == b
      RedNotBlack b -> False -- ((modBy 2 (numberToPocket number)) == 0) == b
      Half n -> (number >= n) && (number <= (n + 18))
      _ -> False -- TODO crash
  in
    if valid then (winChance bet) else 0

calcAllPayout : Int -> List BetTypes -> Int
calcAllPayout number bets =
  let
    x = 0
    winningBets = List.map (\bet -> calcSinglePayout number bet) bets
  in
    List.sum winningBets

subscriptions : Model -> Sub Msg
subscriptions model = Sub.none

roRed = "#c00"
roBlack = "#333"
roGreen = "#090"
roWhite = "#fff"

roG : Int -> Int -> List (Svg.Svg Msg) -> Svg.Svg Msg
roG x y elements = Svg.g [ transform ("translate(" ++ (String.fromInt x) ++ "," ++ (String.fromInt y) ++ ")") ] elements

roRect : Int -> Int -> Int -> Int -> String -> Msg -> Svg.Svg Msg
roRect x y width height fillColor clickEvent =
  Svg.rect [ Svg.Attributes.x (String.fromInt x), Svg.Attributes.y (String.fromInt y), Svg.Attributes.width (String.fromInt width), Svg.Attributes.height (String.fromInt height), fill fillColor, stroke roWhite, strokeWidth "2", Svg.Events.onClick clickEvent ] []

roText px py text = Svg.node "text" [ x (String.fromInt px), y (String.fromInt py), textAnchor "middle", dominantBaseline "central", fill roWhite, style "pointer-events: none" ] [ Svg.text text ]

roNumberToColor : Int -> String
roNumberToColor n =
  let
    pocket = numberToPocket n
  in
    if pocket == 0 then
      roGreen
    else if (modBy 2 pocket) == 0 then
      roBlack
    else
      roRed

roAngle = 360.0 / toFloat (36 + 1) -- 9.729729...
roStraightWidth = 50
roStraightHeight = 70
roStraightWidth2 = roStraightWidth // 2
roStraightHeight2 = roStraightHeight // 2

calcCentre n =
  let
    px = 500 + (((n - 1) // 3) * roStraightWidth)
    py = 200 + roStraightHeight - ((modBy 3 (n - 1)) * roStraightHeight)
  in
    (px, py)

viewPie : Int -> Svg.Svg Msg
viewPie n =
  Svg.g [ transform ("rotate(" ++ (String.fromFloat (numberToAngle n)) ++ " 200 200)") ] [
    Svg.polygon [ points "200,200 216,10 184,10", fill (roNumberToColor n), stroke roWhite, strokeWidth "1" ] [],
    roText 200 25 (String.fromInt n)
  ]

viewStraight : Int -> Svg.Svg Msg
viewStraight n =
  let
    (px, py) = calcCentre n
  in
    Svg.g [] [
      roG px py [
        roRect -roStraightWidth2 -roStraightHeight2 roStraightWidth roStraightHeight (roNumberToColor n) (Bet (Straight n)),
        roText 0 0 (String.fromInt n)
      ],
      viewPie n
    ]

viewZero =
  let
    (cx, cy) = calcCentre 1
    (px, py) = (cx - roStraightWidth, cy - roStraightHeight)
  in
    Svg.g [] [
      roG px py [
        roRect -roStraightWidth2 (-roStraightHeight2 - roStraightHeight) roStraightWidth (3 * roStraightHeight) (roNumberToColor 0) (Bet Unknown)
      ],
      viewPie 0
    ]

roClickArea : Msg -> Svg.Svg Msg
roClickArea clickEvent = Svg.circle [ cx "0", cy "0", r "10", fill "#fff3", strokeWidth "1", stroke "#fff6", Svg.Events.onClick clickEvent ] []

viewStreet n =
  let
    (px, py) = calcCentre n
  in
    Svg.g [] [
      roG px (py + roStraightHeight2) [ roClickArea (Bet (Street n)) ],
      roG px (py - (roStraightHeight * 2) - roStraightHeight2) [ roClickArea (Bet (Street n)) ]
    ]

viewSixLine n =
  let
    (px, py) = calcCentre n
  in
    Svg.g [] [
      roG (px + roStraightWidth2) (py + roStraightHeight2) [ roClickArea (Bet (SixLine n)) ],
      roG (px + roStraightWidth2) (py - roStraightHeight2 - (2 * roStraightHeight)) [ roClickArea (Bet (SixLine n)) ]
    ]

viewCorner n =
  let
    (px, py) = calcCentre n
  in
    roG (px + roStraightWidth2) (py - roStraightHeight2) [ roClickArea (Bet (Corner n)) ]

viewSplitH n =
  let
    (px, py) = calcCentre n
  in
    roG px (py - roStraightHeight2) [ roClickArea (Bet (SplitH n)) ]

viewSplitV n =
  let
    (px, py) = calcCentre n
  in
    roG (px + roStraightWidth2) py [ roClickArea (Bet (SplitV n)) ]

stringFromBet bet =
  case bet of
    Straight n -> "Straight " ++ (String.fromInt n)
    Street n -> "Street " ++ (String.fromInt n)
    SixLine n -> "SixLine " ++ (String.fromInt n)
    SplitH n -> "SplitH " ++ (String.fromInt n)
    SplitV n -> "SplitV " ++ (String.fromInt n)
    Corner n -> "Corner " ++ (String.fromInt n)
    _ -> "?"

viewBet bet =
  case bet of
    Zero -> viewZero
    Straight n -> viewStraight n
    Street n -> viewStreet n
    SixLine n -> viewSixLine n
    SplitH n -> viewSplitH n
    SplitV n -> viewSplitV n
    Corner n -> viewCorner n
    _ -> Svg.g [] []

-- TODO write better version with less expensive function calls?
listIndex : a -> List a -> Maybe Int
listIndex member list =
  let
    listIndexed = List.indexedMap (\i v -> (i, v)) list
    listFiltered = List.filter (\(i, v) -> v == member) listIndexed
    listResult = List.map (\(i, v) -> i) listFiltered
  in
    List.head listResult

default : a -> Maybe a -> a
default def maybeValue =
  case maybeValue of
    Just x -> x
    Nothing -> def

numberToPocket : Int -> Int
numberToPocket n = default 0 (listIndex (Straight n) roPossibleBets)

numberToAngle : Int -> Float
numberToAngle n = (toFloat (numberToPocket n)) * roAngle

view : Model -> Html.Html Msg
view model =
  Html.div [] [
    Html.div [] [
      Svg.svg [ width "1200", height "400", style "background-color: #060" ] [
        Svg.g [] (List.map viewBet roPossibleBets),
        Svg.circle [ cx "200", cy "200", r "190", stroke roWhite, strokeWidth "2", fill "#fff0"] [],
        Svg.circle [ cx "200", cy "200", r "160", stroke roWhite, strokeWidth "2", fill "#fff0"] [],
        Svg.circle [ cx "200", cy "200", r "130", fill roWhite] [],
        Svg.g [ transform ("rotate(" ++ (String.fromFloat (numberToAngle model.number)) ++ ",200,200)")] [
          Svg.circle [ cx "200", cy "55", r "8", fill roWhite] []
        ]
      ],
      Html.div [] [
        Html.button [ Html.Events.onClick Test ] [ Html.text "Test" ],
        Html.button [ Html.Events.onClick Spin ] [ Html.text "Spin" ],
        Html.text (" My:" ++ String.fromInt model.my),
        Html.text (" Number:" ++ String.fromInt model.number),
        Html.text (" Money:" ++ String.fromInt model.money),
        Html.text (" Bets:[" ++ String.join "|" (List.map stringFromBet (model.bets)) ++ "]"),
        Html.text ""
      ]
    ]
  ]
