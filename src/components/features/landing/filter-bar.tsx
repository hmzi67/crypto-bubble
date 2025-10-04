import React from "react";

const FILTERS = [
    { key: "hour", label: "Hour" },
    { key: "day", label: "Day" },
    { key: "week", label: "Week" },
    { key: "month", label: "Month" },
    { key: "year", label: "Year" },
    { key: "3m_rank_name", label: "3 Months Rank ⇅ & Name" },
];

export default function FilterBar({ selected, onSelect }: {
    selected: string;
    onSelect: (key: string) => void;
}) {
    return (
        <div className="flex gap-2 py-2 px-4 bg-gray-800/90 border-b border-gray-700/40 items-center">
            {FILTERS.map((f) => (
                <button
                    key={f.key}
                    onClick={() => onSelect(f.key)}
                    className={`px-4 py-2 rounded-xl font-semibold text-white transition-all border-2 focus:outline-none
            ${selected === f.key
                            ? "bg-yellow-500/80 border-yellow-400 text-gray-900 shadow-lg"
                            : "bg-gray-900/60 border-blue-400 text-white hover:bg-blue-500/10"}
          `}
                >
                    {f.label}
                </button>
            ))}
        </div>
    );
}
