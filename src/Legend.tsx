export type LegendItem = {
  label: string;
  color: string;
};

export const Legend = <T extends LegendItem>({
  onClick,
  legendItems,
}: {
  legendItems: T[];
  onClick: (arg0: T) => void;
}) => (
  <div style={{ fontSize: "0.7em" }}>
    {legendItems.map((legendItem) => (
      <span
        key={legendItem.label}
        className="hoverline"
        style={{
          marginRight: 15,
          // cursor: "pointer",
          // textDecoration:
          // (startupFilters.phases.includes(phase.id) && "underline") || "auto",
        }}
        onClick={() => onClick(legendItem)}
      >
        <span
          style={{
            width: 15,
            height: 15,
            display: "inline-block",
            verticalAlign: "middle",
            marginRight: 5,
            backgroundColor: legendItem.color,
          }}
        />
        {legendItem.label}
      </span>
    ))}
  </div>
);
