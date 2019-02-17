import Browser
import Html
import Html.Attributes
import Html.Events
import Random
import Time
import Svg
import Svg.Attributes exposing (..)
import Svg.Events
import Dict exposing (Dict)
import Array exposing (Array)

main = Browser.element { init = init, update = update, subscriptions = subscriptions, view = view }

type Rotation = LeftTop | LeftBottom | RightTop | RightBottom
type alias Mirror = { x : Int, y : Int, r : Rotation }

type alias Model = { dice : Int, ms : Int, mirrors : Array Mirror }

type Msg = Roll | Dice Int | Tick Time.Posix | Rotate Int

-- TODO init with current time
init : () -> (Model, Cmd Msg)
init _ =
  ({
    dice = 0,
    ms = 0,
    mirrors = Array.fromList [
      { x = 100, y = 100, r = LeftTop},
      { x = 200, y = 100, r = LeftBottom},
      { x = 100, y = 200, r = RightTop},
      { x = 200, y = 200, r = RightBottom}
    ]
  }, Cmd.none)

update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
  case msg of
    Roll ->
      (model, Random.generate Dice (Random.int 1 6))
    Dice dice ->
      ({ model | dice = dice }, Cmd.none)
    Rotate n ->
      --({model | ms = 0 }, Cmd.none)
      --({model | mirrors = Dict.update n updateRotation model.mirrors} , Cmd.none)
      --({model | mirrors = Array.set n {x=0, y=0, r=LeftTop} model.mirrors} , Cmd.none)
      ({model | mirrors = arrayUpdate n (\m -> { m | r = (rotationNext m.r) }) model.mirrors} , Cmd.none)
      
    Tick time ->
      ({model | ms = (Time.posixToMillis time) }, Cmd.none)

arrayUpdate : Int -> (a -> a) -> Array a -> Array a
arrayUpdate n fun array =
  case (Array.get n array) of
    Just element -> Array.set n (fun element) array
    Nothing -> array

updateRotation m =
  case m of
    Just { x, y, r } -> Just { x = x, y = y, r = (rotationNext r) }
    Nothing -> Just { x = 0, y = 0, r = LeftTop }

subscriptions : Model -> Sub Msg
subscriptions model = Time.every 1000 Tick

rotationNext : Rotation -> Rotation
rotationNext rotation =
  case rotation of
    LeftTop -> RightTop
    LeftBottom -> LeftTop
    RightTop -> RightBottom
    RightBottom -> LeftBottom

rotationToSvgTransform : Rotation -> String
rotationToSvgTransform rotation =
  case rotation of
    LeftTop -> "rotate(0)"
    LeftBottom -> "rotate(270)"
    RightTop -> "rotate(90)"
    RightBottom -> "rotate(180)"

mirrorToSvg : (Int, Mirror) -> (Svg.Svg Msg)
mirrorToSvg (n, { x, y, r }) =
  Svg.g [ transform ("translate(" ++ (String.fromInt x) ++ "," ++ (String.fromInt y) ++ ")") ] [
    Svg.rect [ Svg.Attributes.x "-20", Svg.Attributes.y "-20", width "40", height "40", rx "3", ry "3", fill "#eee", Svg.Events.onClick (Rotate n) ] [],
    Svg.g [ transform (rotationToSvgTransform r) ] [
      Svg.polygon [ points "-10,10 10,10 10,-10", fill "black", style "pointer-events: none" ] [ ]
    ]
  ]

view : Model -> Html.Html Msg
view model =
  let
    elements = List.map mirrorToSvg (Array.toIndexedList model.mirrors)
  in
    Html.div [] [
      Svg.svg [ width "800", height "800" ] elements,
      Html.div [ Html.Attributes.style "color" "#666" ] [
        Html.button [ Html.Events.onClick Roll ] [ Html.text "Roll" ],
        Html.text " Dice:",
        Html.text (String.fromInt model.dice),
        Html.text " Time:",
        Html.text (String.fromInt model.ms)
      ]
    ]
