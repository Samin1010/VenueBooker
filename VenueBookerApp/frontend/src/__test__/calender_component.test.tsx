import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import CalendarComponent from "@/components/Calendar";

describe("CalenderComponent",() => {
    const setup = (date = new Date(2027,4,20)) => {
        const setCurrentDate = jest.fn();

        render(
            <CalendarComponent
                currentDate={date}
                setCurrentDate={setCurrentDate}
            />
        )

        return { setCurrentDate };
    };

    it("renders the current month and year",() => {
        setup();

        expect(screen.getByText(/may 2027/i)).toBeInTheDocument();
    });

    it("renders all weekday headers",() => {
        setup();

        expect(screen.getByText("Sun")).toBeInTheDocument();

        expect(screen.getByText("Mon")).toBeInTheDocument();

        expect(screen.getByText("Tue")).toBeInTheDocument();

        expect(screen.getByText("Wed")).toBeInTheDocument();

        expect(screen.getByText("Thu")).toBeInTheDocument();

        expect(screen.getByText("Fri")).toBeInTheDocument();

        expect(screen.getByText("Sat")).toBeInTheDocument();
        
    });

    it("goes to previous month when left button is clicked",() => {
        const { setCurrentDate } = setup(new Date(2027,4,20));

        fireEvent.click(screen.getByRole("button",{name : /←/i}));

        expect(setCurrentDate).toHaveBeenCalledWith(new Date(2027,3,1));
    })

    it("goes to previous month when right button is clicked",() => {
        const { setCurrentDate } = setup(new Date(2027,4,20));

        fireEvent.click(screen.getByRole("button",{name : /→/i}));

        expect(setCurrentDate).toHaveBeenCalledWith(new Date(2027,5,1));
    });


    it("selects a future day when clicked",() => {
        const { setCurrentDate } = setup(new Date(2027,4,1));

        fireEvent.click(screen.getByText("20"));

        expect(setCurrentDate).toHaveBeenCalled();

        expect(setCurrentDate).toHaveBeenCalledWith(new Date(2027,4,20));
    });

    it("does not select a past day",() => {
        const today = new Date();

        const pastMontHDate = new Date(today.getFullYear(),today.getMonth() -1 ,1);
        
        const { setCurrentDate } = setup(pastMontHDate)

        fireEvent.click(screen.getByText("1"));

        expect(setCurrentDate).not.toHaveBeenCalled();
    })




})