
module MyModule exposing (myStringFromIntPlusOne)

myStringFromIntPlusOne : Int -> String
myStringFromIntPlusOne value = String.fromInt (value + 1)