import { render, screen } from "@testing-library/react";

function Hello() {
  return <h1>Hello Cyna</h1>;
}

test("react testing library est opérationnel", () => {
  render(<Hello />);
  expect(screen.getByRole("heading", { name: "Hello Cyna" })).toBeInTheDocument();
});
