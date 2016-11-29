import test from "tape"
import epmFile from "../src"

test("epmFile", (t) => {
  t.plan(1)
  t.equal(true, epmFile(), "return true")
})
