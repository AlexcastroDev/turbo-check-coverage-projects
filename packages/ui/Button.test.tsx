import { Button } from "./Button";
import { render, screen } from "@testing-library/react";

describe('Button', () => {
    it('should render', () => {
        render(<Button />);
        expect(screen).toMatchSnapshot();
    });
})