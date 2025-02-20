import {Card} from "@/components/ui/card.tsx";
import React from "react";
import {Label} from "@/components/ui/label.tsx";

interface CardProps {
    name: any
    content?: string
    className: string
    prefix?: string
}
const CardMarketing: React.FC<CardProps> = ({name, content, className, prefix}: CardProps) => {
    return (
        <Card className={`p-4 ${className}`}>
            <div className="flex flex-col p-4">
                <Label htmlFor="total" className="my-2 font-bold text-2xl text-oxfordBlue">
                    {name}
                </Label>
                <div className="flex justify-between mt-2 text-nowrap">
                    <div className="flex flex-row">
                        <p className="align-text-top text-oxfordBlue  font-bold">{prefix}</p> <p
                        className="text-oxfordBlue text-xl ml-1 font-bold">
                        {content}</p>
                    </div>

                </div>
            </div>
        </Card>
    )
}

export default CardMarketing;