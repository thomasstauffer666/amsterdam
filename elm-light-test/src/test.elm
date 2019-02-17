import Browser
import Html exposing (Html, button, div, text)
import Html.Attributes exposing (style)
import Html.Events exposing (onClick)
import Random
import Time

main = Browser.element { init = init, update = update, subscriptions = subscriptions, view = view }

type alias Model = { dice : Int, ms : Int }

-- TODO init with current time
init : () -> (Model, Cmd Msg)
init _ = ({dice = 0, ms = 0 }, Cmd.none)

type Msg = Roll | Dice Int | Tick Time.Posix

update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
  case msg of
    Roll ->
      (model, Random.generate Dice (Random.int 1 6))
    Dice dice ->
      ({ model | dice = dice }, Cmd.none)
    Tick time ->
      ({model | ms = (Time.posixToMillis time)}, Cmd.none)
    

subscriptions : Model -> Sub Msg
subscriptions model = Sub.batch [ Time.every 1000 Tick ]

view : Model -> Html Msg
view model =
  div [] [
    div [ style "font-weight" "bold" ] [
      button [ onClick Roll ] [ text "Roll" ],
      text " Dice:",
      text (String.fromInt model.dice),
      text " Time:",
      text (String.fromInt model.ms)
    ]
  ]
