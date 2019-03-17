
import Browser
import Html
import Html.Attributes
import Html.Events
import MyModule

main = Browser.element { init = init, update = update, subscriptions = subscriptions, view = view }

type alias Model = {my : Int}

init : () -> (Model, Cmd Msg)
init _ = ({my = 1}, Cmd.none)

type Msg = Test

update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
  case msg of
    Test -> ({model | my = model.my * 10}, Cmd.none)

subscriptions : Model -> Sub Msg
subscriptions model = Sub.none

view : Model -> Html.Html Msg
view model =
  Html.div [] [
    Html.button [ Html.Events.onClick Test ] [ Html.text "Test" ],
    Html.text (" My:" ++ (MyModule.myStringFromIntPlusOne model.my)),
    Html.text ""
  ]
