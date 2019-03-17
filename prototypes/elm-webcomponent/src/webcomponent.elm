
import Browser
import Html exposing (Html, button, div, text)
import Html.Attributes exposing (style)
import Html.Events exposing (onClick)

main = Browser.element { init = init, update = update, subscriptions = subscriptions, view = view }

myP : List (Html.Attribute a) -> List (Html a) -> Html a
myP = Html.node "my-p"

type alias Model = { my : Int }

init : () -> (Model, Cmd Msg)
init _ = ({my = 0}, Cmd.none)

type Msg = Test | Idle

update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
  case msg of
    Test -> ({ model | my = model.my + 1}, Cmd.none)
    Idle -> (model, Cmd.none)

subscriptions : Model -> Sub Msg
subscriptions model = Sub.none

-- TODO seems to be impossible, script tags are replaced, custom onLoad as replaced, ... :(
script =
  """
  console.log('hi from inside elm');
  """

view : Model -> Html Msg
view model =
  div [] [
    Html.node "h1" [] [ text "Ho" ],
    Html.node "p" [ Html.Attributes.attribute "onLoad" "is-replaced-fuuu" ] [ text "xxx" ],
    myP [ Html.Attributes.attribute "text" (String.fromInt model.my) ] [],
    myP [ Html.Attributes.attribute "text" "updated from elm" ] [],
    div [ style "font-weight" "bold" ] [
      button [ onClick Test ] [ text "Test" ],
      button [ onClick Idle ] [ text "Idle" ],
      text " My:",
      text (String.fromInt model.my)
    ]
  ]
