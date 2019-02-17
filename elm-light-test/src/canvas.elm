
import Browser
import Html exposing (Html, button, div, text, canvas, p)
import Html.Attributes exposing (width, height, style)
import Html.Events exposing (onClick)

--import Canvas exposing (..)
-- import Canvas exposing (Size, Point, Canvas)

main = Browser.element { init = init, update = update, subscriptions = subscriptions, view = view }

type alias Model = { x : Int, y : Int }

init : () -> (Model, Cmd Msg)
init _ = ({ x = 0, y = 0 }, Cmd.none)

type Msg = Left | Right | Up | Down

update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
  case msg of
    Left ->
      ({ model | x = model.x - 1 }, Cmd.none)
    Right ->
      ({ model | x = model.x + 1 }, Cmd.none)
    Up ->
      ({ model | y = model.y - 1 }, Cmd.none)
    Down ->
      ({ model | y = model.y + 1 }, Cmd.none)

subscriptions : Model -> Sub Msg
subscriptions model = Sub.none

-- renderSquare = shapes [ fill (Color.rgba 0 255 0 1) ] [ rect (0, 0) 100 50 ]

view : Model -> Html Msg
view model =
  div [] [
    -- div [] [ canvas [ width 640, height 480, style "border" "1px solid #f0f" ] [ ] ],
    div [] [
        --Canvas.toHtml (640, 480)
        --    [ style "border" "1px solid #f0f" ]
        --    [ shapes [ fill Color.red ] [ rect (0, 0) 640 480 ] 
        --    , renderSquare
        --    ]    
    ],
    div[] [
      button [ onClick Left ] [ text "Left" ],
      button [ onClick Right ] [ text "Right" ],
      button [ onClick Up ] [ text "Up" ],
      button [ onClick Down ] [ text "Down" ]
    ],
    div [] [
      text "Position:",
      text (String.fromInt model.x),
      text "/",
      text (String.fromInt model.y)
    ]
  ]
