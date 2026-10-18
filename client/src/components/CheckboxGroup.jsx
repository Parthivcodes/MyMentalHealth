export default function CheckboxGroup({ label, name, items, selected, onChange }) {
  function toggle(item) {
    if (selected.includes(item)) onChange(selected.filter((x) => x !== item));
    else onChange([...selected, item]);
  }

  return (
    <div className="mb-3">
      <div className="form-label">{label}</div>
      <div className="d-flex flex-wrap gap-2">
        {items.map((item) => (
          <div key={item}>
            <input type="checkbox" className="btn-check" id={`${name}-${item}`} autoComplete="off"
              checked={selected.includes(item)} onChange={() => toggle(item)} />
            <label className="btn btn-sm btn-outline-primary" htmlFor={`${name}-${item}`}>{item}</label>
          </div>
        ))}
      </div>
    </div>
  );
}
