
-- all icons are from https://game-icons.net/

import Browser
import Html
import Html.Attributes
import Html.Events
import Svg
import Svg.Attributes exposing (..)
import Svg.Events
import Array exposing (Array)

main = Browser.element {init = init, update = update, subscriptions = subscriptions, view = view}

type MirrorRotation = LeftTop | LeftBottom | RightTop | RightBottom
type alias ObjectMirror = {r : MirrorRotation}
type alias ObjectCell = {}
type alias ObjectBattery = {}
type alias Direction = {x : Int, y : Int}
type alias Point = {x : Int, y : Int}
type ObjectClass = Mirror ObjectMirror | Cell ObjectCell | Battery ObjectBattery
type alias Object = {p : Point, class : ObjectClass}
type alias Model = {objects : Array Object}

type Msg = Rotate Int

init : () -> (Model, Cmd Msg)
init _ =
  ({
    objects = Array.fromList [
      {p = {x = 100, y = 300}, class = Cell {}},
      {p = {x = 300, y = 100}, class = Mirror {r = RightBottom}},
      {p = {x = 500, y = 100}, class = Mirror {r = LeftBottom}},
      {p = {x = 300, y = 300}, class = Mirror {r = LeftTop}},
      {p = {x = 500, y = 300}, class = Mirror {r = RightTop}},
      {p = {x = 700, y = 300}, class = Battery {}}
    ]
 }, Cmd.none)

update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
  case msg of
    Rotate n -> ({model | objects = arrayUpdate n updateObject model.objects} , Cmd.none)

updateObject : Object -> Object
updateObject object =
  case object.class of
    Mirror v -> {object | class = Mirror {r = (rotationNext v.r)}}
    Battery _ -> object
    Cell _ -> object

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

viewMirror : Int -> Point -> MirrorRotation -> (Svg.Svg Msg)
viewMirror n p r =
  Svg.g [ transform ("translate(" ++ (String.fromInt p.x) ++ "," ++ (String.fromInt p.y) ++ ")") ] [
    Svg.rect [ Svg.Attributes.x "-20", Svg.Attributes.y "-20", width "40", height "40", rx "5", ry "5", fill "#ccf", Svg.Events.onClick (Rotate n) ] [],
    Svg.image [ Svg.Attributes.x "20", Svg.Attributes.y "20", width "40", height "40", xlinkHref "mirror-mirror.svg" ] [],
    Svg.g [ transform (rotationToSvgTransform r) ] [
      Svg.polygon [ points "-10,10 10,10 10,-10", fill "#000", style "pointer-events: none" ] []
    ]
  ]

viewCell : Int -> Point -> (Svg.Svg Msg)
viewCell n p =
  Svg.g [ transform ("translate(" ++ (String.fromInt p.x) ++ "," ++ (String.fromInt p.y) ++ ")") ] [
    Svg.rect [ Svg.Attributes.x "-20", Svg.Attributes.y "-20", width "40", height "40", rx "5", ry "5", fill "#ccc", Svg.Events.onClick (Rotate n) ] [],
    Svg.circle [ Svg.Attributes.x "0", Svg.Attributes.y "0", r "10", fill "#000"] [],
    Svg.image [ Svg.Attributes.x "20", Svg.Attributes.y "20", width "40", height "40", xlinkHref "laser-warning.svg" ] []
  ]

viewBattery : Int -> Point -> (Svg.Svg Msg)
viewBattery n p =
  Svg.g [ transform ("translate(" ++ (String.fromInt p.x) ++ "," ++ (String.fromInt p.y) ++ ")") ] [
    Svg.rect [ Svg.Attributes.x "-20", Svg.Attributes.y "-20", width "40", height "40", rx "5", ry "5", fill "#ccc", Svg.Events.onClick (Rotate n) ] [],
    Svg.circle [ Svg.Attributes.x "0", Svg.Attributes.y "0", r "10", fill "#000"] [],
    Svg.image [ Svg.Attributes.x "20", Svg.Attributes.y "20", width "40", height "40", xlinkHref "battery-pack-alt.svg" ] []
  ]

viewObject : (Int, Object) -> (Svg.Svg Msg)
viewObject (n, object) =
  case object.class of
    Mirror v -> viewMirror n object.p v.r
    Cell v -> viewCell n object.p
    Battery v -> viewBattery n object.p

viewLine : Point -> Point -> Float -> (Svg.Svg Msg)
viewLine p1 p2 width =
  Svg.line [ Svg.Attributes.x1 (String.fromInt p1.x), Svg.Attributes.y1 (String.fromInt p1.y), Svg.Attributes.x2 (String.fromInt p2.x), Svg.Attributes.y2 (String.fromInt p2.y), stroke "red", strokeWidth (String.fromFloat width) ] []

square : Int -> Int
square v = v * v

distanceSquared : Point -> Point -> Int
distanceSquared p1 p2 = (square (p1.x - p2.x)) + (square (p1.y - p2.y))

-- http://paulbourke.net/geometry/pointlineplane/
isIntersectionLineSegmentLineSegment : Point -> Point -> Point -> Point -> Bool
isIntersectionLineSegmentLineSegment p1 p2 p3 p4 =
  let
    uan = (p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x)
    ubn = (p2.x - p1.x) * (p1.y - p3.y) - (p2.y - p1.y) * (p1.x - p3.x)
    d = (p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y)
  in
    if d == 0 then
      False
    else
      let
        ua = (toFloat uan) / (toFloat d)
        ub = (toFloat ubn) / (toFloat d)
      in
        (ua > 0.0) && (ua < 1.0) && (ub > 0.0) && (ub < 1.0)

isIntersectionLineSegmentPoint : Point -> Point -> Point -> Bool
isIntersectionLineSegmentPoint p1 p2 p3 =
  let
    -- make a small rectangle around the point
    pp1 = {x = p3.x - 5, y = p3.y - 5}
    pp2 = {x = p3.x + 5, y = p3.y - 5}
    pp3 = {x = p3.x + 5, y = p3.y + 5}
    pp4 = {x = p3.x - 5, y = p3.y + 5}
    intersect = isIntersectionLineSegmentLineSegment
  in
    (intersect p1 p2 pp1 pp2) || (intersect p1 p2 pp2 pp3) || (intersect p1 p2 pp3 pp4) || (intersect p1 p2 pp4 pp1)

findClosest : Array Object -> Point -> Direction -> Maybe Object
findClosest objects p dir =
  let
    p2 = {x = p.x + dir.x, y = p.y + dir.y}
    isIntersected object = (not ((object.p.x == p.x) && (object.p.y == p.y))) && (isIntersectionLineSegmentPoint p p2 object.p)
    distance object = distanceSquared p object.p
    intersected = Array.filter isIntersected objects
    distances = Array.map distance intersected
  in
    -- TODO fix this, it is not always the first elment. sort array (how? conver to list and back?) and just take closest one
    Array.get 0 intersected

viewRay : Array Object -> Object -> Direction -> Float -> List (Svg.Svg Msg)
viewRay objects current incident strength =
  if strength < 0.5 then
    []
  else
    case current.class of
      Cell _ ->
        let
          dir = {x = 222, y = 0}
        in
          case (findClosest objects current.p dir) of
            Just other -> [ (viewLine current.p other.p strength) ] ++ (viewRay objects other dir (strength - 1.0))
            Nothing -> [ (viewLine current.p {x = (current.p.x + dir.x), y = (current.p.y + dir.y)} 0.5) ]
      Battery _ -> []
      Mirror mirror ->
        let
          dir = case mirror.r of
            LeftTop -> {x = incident.y, y = -incident.x}
            LeftBottom -> {x = -incident.y, y = incident.x}
            RightTop -> {x = -incident.y, y = incident.x}
            RightBottom -> {x = incident.y, y = -incident.x}
        in
          case (findClosest objects current.p dir) of
            Just other -> [ (viewLine current.p other.p strength) ] ++ (viewRay objects other dir (strength - 1.0))
            Nothing -> [ (viewLine current.p {x = (current.p.x + dir.x), y = (current.p.y + dir.y)} 0.5) ]

boolToString : Bool -> String
boolToString v = if v then "True" else "False"

view : Model -> Html.Html Msg
view model =
  let
    rays = case (Array.get 0 model.objects) of
      Just object -> viewRay model.objects object {x = 0, y = 0} 5.0
      Nothing -> []
    objects = List.map viewObject (Array.toIndexedList model.objects)
  in
    Html.div [] [
      Svg.svg [ width "1300", height "800", style "background-color: #eee" ] [
        Svg.circle [ x "10", y "10", r "10" ] [],
        Svg.g [ x "0", y "0" ] (objects ++ rays)
      ],
      Html.div [ Html.Attributes.style "color" "#666" ] [
        Html.text "? ",
        -- Test
        Html.text (boolToString (isIntersectionLineSegmentPoint {x=0,y=0} {x=100,y=0} {x=105,y=0}))
      ]
    ]
