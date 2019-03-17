
import Browser
import Html
import Html.Attributes
import Html.Events

-- completly unfinished example, is there no way to draw on canvas without a custom component?

-- joakin/elm-canvas?

main = Browser.element { init = init, update = update, subscriptions = subscriptions, view = view }

type alias Model = { x : Int, y : Int }

init : () -> (Model, Cmd Msg)
init _ = ({x = 0, y = 0}, Cmd.none)

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

view : Model -> Html.Html Msg
view model =
  Html.div [] [
    Html.div [] [
      Html.canvas [ Html.Attributes.width 160, Html.Attributes.height 120, Html.Attributes.style "border" "1px solid #f0f" ] []
    ],
    Html.div [] [
      Html.button [ Html.Events.onClick Left ] [ Html.text "Left" ],
      Html.button [ Html.Events.onClick Right ] [ Html.text "Right" ],
      Html.button [ Html.Events.onClick Up ] [ Html.text "Up" ],
      Html.button [ Html.Events.onClick Down ] [ Html.text "Down" ]
    ],
    Html.div [] [
      Html.text "Position:",
      Html.text (String.fromInt model.x),
      Html.text "/",
      Html.text (String.fromInt model.y)
    ]
  ]
