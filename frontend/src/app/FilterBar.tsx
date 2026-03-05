"use client";

export type SentimentFilter = "all" | "humorous" | "historical" | "nature" | "katta";

interface FilterBarProps {
    active: SentimentFilter;
    onChange: (filter: SentimentFilter) => void;
}

const FILTERS: { label: string; value: SentimentFilter; emoji: string }[] = [
    { label: "सर्व", value: "all", emoji: "🗺" },
    { label: "विनोदी", value: "humorous", emoji: "😄" },
    { label: "ऐतिहासिक", value: "historical", emoji: "🏛" },
    { label: "निसर्ग", value: "nature", emoji: "🌿" },
    { label: "कट्टा", value: "katta", emoji: "☕" },
];

export default function FilterBar({ active: act, onChange }: FilterBarProps) {
    return (
        <div className="kn-filterbar">
            {FILTERS.map(({ label, value, emoji }) => (
                <button
                    key={value}
                    onClick={() => onChange(value)}
                    className={`kn-filter-btn${act === value ? " active" : ""}`}
                >
                    {emoji} {label}
                </button>
            ))}
        </div>
    );
}
