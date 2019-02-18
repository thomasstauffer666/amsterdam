import Browser
import Html
import Html.Attributes
import Html.Events
import Svg
import Svg.Attributes exposing (..)
import Svg.Events
import Array exposing (Array)

main = Browser.element { init = init, update = update, subscriptions = subscriptions, view = view }

type MirrorRotation = LeftTop | LeftBottom | RightTop | RightBottom
type alias ObjectMirror = { x : Int, y : Int, r : MirrorRotation }
type alias ObjectCell = { x : Int, y : Int }
type alias ObjectBattery = { x : Int, y : Int }

type Object = Mirror ObjectMirror | Cell ObjectCell | Battery ObjectBattery

type alias Model = { objects : Array Object }
  
type Msg = Rotate Int

init : () -> (Model, Cmd Msg)
init _ =
  ({
    objects = Array.fromList [
      Mirror { x = 300, y = 100, r = LeftTop},
      Mirror { x = 500, y = 100, r = LeftBottom},
      Mirror { x = 300, y = 300, r = RightTop},
      Mirror { x = 500, y = 300, r = RightBottom},
      Battery { x = 700, y = 300},
      Cell { x = 100, y = 300 }
    ]
  }, Cmd.none)

update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
  case msg of
    Rotate n ->
      ({model | objects = arrayUpdate n updateObject model.objects} , Cmd.none)

updateObject : Object -> Object
updateObject object =
  case object of
    Mirror v -> Mirror {v | r = (rotationNext v.r)}
    Battery v -> Battery v
    Cell v -> Cell v

arrayUpdate : Int -> (a -> a) -> Array a -> Array a
arrayUpdate n fun array =
  case (Array.get n array) of
    Just element -> Array.set n (fun element) array
    Nothing -> array

subscriptions : Model -> Sub Msg
subscriptions model = Sub.none

rotationNext : MirrorRotation -> MirrorRotation
rotationNext rotation =
  case rotation of
    LeftTop -> RightTop
    LeftBottom -> LeftTop
    RightTop -> RightBottom
    RightBottom -> LeftBottom

rotationToSvgTransform : MirrorRotation -> String
rotationToSvgTransform rotation =
  case rotation of
    LeftTop -> "rotate(0)"
    LeftBottom -> "rotate(270)"
    RightTop -> "rotate(90)"
    RightBottom -> "rotate(180)"

drawMirror : (Int, ObjectMirror) -> (Svg.Svg Msg)
drawMirror (n, { x, y, r }) =
  Svg.g [ transform ("translate(" ++ (String.fromInt x) ++ "," ++ (String.fromInt y) ++ ")") ] [
    Svg.rect [ Svg.Attributes.x "-20", Svg.Attributes.y "-20", width "40", height "40", rx "5", ry "5", fill "#ccf", Svg.Events.onClick (Rotate n) ] [],
    Svg.image [ Svg.Attributes.x "20", Svg.Attributes.y "20", width "40", height "40", xlinkHref "mirror-mirror.svg" ] [],
    Svg.g [ transform (rotationToSvgTransform r) ] [
      Svg.polygon [ points "-10,10 10,10 10,-10", fill "#000", style "pointer-events: none" ] []
    ]
  ]
  
drawCell : (Int, ObjectCell) -> (Svg.Svg Msg)
drawCell (n, { x, y }) =
  Svg.g [ transform ("translate(" ++ (String.fromInt x) ++ "," ++ (String.fromInt y) ++ ")") ] [
    Svg.rect [ Svg.Attributes.x "-20", Svg.Attributes.y "-20", width "40", height "40", rx "5", ry "5", fill "#ccc", Svg.Events.onClick (Rotate n) ] [],
    Svg.circle [ Svg.Attributes.x "0", Svg.Attributes.y "0", r "10", fill "#000"] [],
    Svg.image [ Svg.Attributes.x "20", Svg.Attributes.y "20", width "40", height "40", xlinkHref "laser-warning.svg" ] []
  ]

drawBattery : (Int, ObjectBattery) -> (Svg.Svg Msg)
drawBattery (n, { x, y }) =
  Svg.g [ transform ("translate(" ++ (String.fromInt x) ++ "," ++ (String.fromInt y) ++ ")") ] [
    Svg.rect [ Svg.Attributes.x "-20", Svg.Attributes.y "-20", width "40", height "40", rx "5", ry "5", fill "#ccc", Svg.Events.onClick (Rotate n) ] [],
    Svg.circle [ Svg.Attributes.x "0", Svg.Attributes.y "0", r "10", fill "#000"] [],
    Svg.image [ Svg.Attributes.x "20", Svg.Attributes.y "20", width "40", height "40", xlinkHref "battery-pack-alt.svg" ] []
  ]

  
drawObject : (Int, Object) -> (Svg.Svg Msg)
drawObject (n, object) =
  case object of
    Mirror v -> drawMirror (n, v)
    Cell v -> drawCell (n, v)
    Battery v -> drawBattery (n, v)

view : Model -> Html.Html Msg
view model =
  let
    elements = List.map drawObject (Array.toIndexedList model.objects)
  in
    Html.div [] [
      Svg.svg [ width "1300", height "800", style "background-color: #eee" ] [
        Svg.circle [ x "10", y "10", r "10" ] [],
        Svg.g [ x "0", y "0" ] elements
      ],
      Html.div [ Html.Attributes.style "color" "#666" ] [
        Html.text "?"
      ]
    ]
