
import Browser
import Html
import Html.Attributes
import Html.Events
import Svg
import Svg.Attributes exposing (stroke, fill, strokeWidth)
import Svg.Events
import Random

-- Note: because of how Elm handles Lists internally and the respective functions, new market values are added at the front of a list

main = Browser.element {init = init, update = update, subscriptions = subscriptions, view = view}

type alias Model = {my : Int, values : List Int}

startValues : List Int
startValues = [5, 7, 5, 3, 2, 2, 5, 3, 2, 3, 5, 5, 5, 7, 5, 5, 5, 0]

init : () -> (Model, Cmd Msg)
init _ = ({my = 0, values = startValues}, Cmd.none)

type Msg = Test | MarketEvent | Evaluation Int

update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
  case msg of
    Test -> ({ model | my = model.my + 1}, Cmd.none)
    MarketEvent -> (model, Random.generate Evaluation (Random.int -5 5))
    Evaluation n -> ({ model | values = max 0 ((Maybe.withDefault 0 (List.head model.values)) + n) :: model.values }, Cmd.none)

subscriptions : Model -> Sub Msg
subscriptions model = Sub.none

svgTransparent = "#fff0"

svgLine : Int -> Int -> Int -> Int -> Svg.Svg Msg
svgLine x1 y1 x2 y2 = Svg.line [Svg.Attributes.x1 (String.fromInt x1), Svg.Attributes.y1 (String.fromInt y1), Svg.Attributes.x2 (String.fromInt x2), Svg.Attributes.y2 (String.fromInt y2),
  strokeWidth "2", stroke "#009", Svg.Attributes.style "vector-effect: non-scaling-stroke"] []

svgRect : Int -> Int -> Int -> Int -> Svg.Svg Msg
svgRect x y width height = Svg.rect [ Svg.Attributes.x (String.fromInt x), Svg.Attributes.y (String.fromInt y), Svg.Attributes.width (String.fromInt width), Svg.Attributes.height (String.fromInt height), strokeWidth "2", stroke "#00f", fill svgTransparent] []

svgText : Int -> Int -> String -> Svg.Svg Msg
svgText x y text = Svg.node "text" [ Svg.Attributes.x (String.fromInt x), Svg.Attributes.y (String.fromInt y), Svg.Attributes.textAnchor "", Svg.Attributes.dominantBaseline "central", Svg.Attributes.fill "#fff"] [Svg.text text]

-- TODO add ticks and description
svgGraph : List Int -> Svg.Svg Msg
svgGraph values =
  let
    distance = 20
    height = 200
    maxNumberOfValues = 30
    width = distance * maxNumberOfValues
    valuesVisible = List.reverse (List.take (maxNumberOfValues + 1) values)
    maximumValue = Maybe.withDefault 0 (List.maximum valuesVisible)
    valuesFirst = valuesVisible
    valuesSecond = Maybe.withDefault [] (List.tail valuesVisible)
    line i (first, second) = svgLine (i * distance) (maximumValue - first) ((i + 1) * distance) (maximumValue - second)
  in
    Svg.g [ Svg.Attributes.transform "translate(20,20)"] [
      Svg.g [ Svg.Attributes.transform ("scale(1," ++ (String.fromFloat (height / (toFloat maximumValue))) ++ ")") ] (List.indexedMap line (List.map2 (\a b -> (a, b)) valuesFirst valuesSecond)),
      svgRect 0 0 width height,
      svgText (width + 5) 0 (String.fromInt maximumValue),
      svgText (width + 5) (height) (String.fromInt 0)
    ]

view : Model -> Html.Html Msg
view model =
  Html.div [] [
    Html.div [] [
      Svg.svg [ Svg.Attributes.width "1200", Svg.Attributes.height "400", Svg.Attributes.style "background-color: #999" ] [
        svgGraph model.values
      ],
      Html.div [] [
        Html.button [ Html.Events.onClick Test ] [ Html.text "Test" ],
        Html.button [ Html.Events.onClick MarketEvent ] [ Html.text "MarketEvent" ],
        Html.text (" My:" ++ String.fromInt model.my),
        Html.text ""
      ]
    ]
  ]
