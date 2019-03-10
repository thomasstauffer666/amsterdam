
import Browser
import Html
import Html.Attributes
import Html.Events
import Svg
import Svg.Attributes exposing (..)
import Svg.Events
import Random

default : a -> Maybe a -> a
default def maybeValue =
  case maybeValue of
    Just x -> x
    Nothing -> def

main = Browser.element {init = init, update = update, subscriptions = subscriptions, view = view}

type alias Model = {my : Int}

init : () -> (Model, Cmd Msg)
init _ = ({my = 0}, Cmd.none)

type Msg = Test

update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
  case msg of
    Test -> ({ model | my = model.my + 1}, Cmd.none)

subscriptions : Model -> Sub Msg
subscriptions model = Sub.none

view : Model -> Html.Html Msg
view model =
  Html.div [] [
    Html.div [] [
      Svg.svg [ width "1200", height "400", style "background-color: #333" ] [
      ],
      Html.div [] [
        Html.button [ Html.Events.onClick Test ] [ Html.text "Test" ],
        Html.text (" My:" ++ String.fromInt model.my),
        Html.text ""
      ]
    ]
  ]
