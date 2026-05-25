export function Section({ title, subtitle, children }) {
  return (
    <section className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
        <h3 className="text-base font-semibold text-slate-800">{title}</h3>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </section>
  );
}

export function Field({ label, children, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-sm font-medium text-slate-600 mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}

export function Input({ className = '', ...props }) {
  return (
    <input
      className={`w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition ${className}`}
      {...props}
    />
  );
}

export function Textarea({ className = '', rows = 3, ...props }) {
  return (
    <textarea
      rows={rows}
      className={`w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition resize-y min-h-[80px] ${className}`}
      {...props}
    />
  );
}

export function CheckboxGroup({ options, value = [], onChange, otherValue, onOtherChange, otherKey = 'other' }) {
  const toggle = (key) => {
    const next = value.includes(key) ? value.filter((k) => k !== key) : [...value, key];
    onChange(next);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <label
          key={opt.key}
          className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer transition text-sm ${
            value.includes(opt.key)
              ? 'bg-indigo-50 border-indigo-300 text-indigo-800'
              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
          }`}
        >
          <input
            type="checkbox"
            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            checked={value.includes(opt.key)}
            onChange={() => toggle(opt.key)}
          />
          {opt.label}
        </label>
      ))}
      {value.includes(otherKey) && onOtherChange && (
        <Input
          className="flex-1 min-w-[200px]"
          placeholder="ระบุ..."
          value={otherValue || ''}
          onChange={(e) => onOtherChange(e.target.value)}
        />
      )}
    </div>
  );
}

export function RadioGroup({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <label
          key={opt.key}
          className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer transition text-sm ${
            value === opt.key
              ? 'bg-indigo-50 border-indigo-300 text-indigo-800'
              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
          }`}
        >
          <input
            type="radio"
            name="radio-group"
            className="border-slate-300 text-indigo-600 focus:ring-indigo-500"
            checked={value === opt.key}
            onChange={() => onChange(opt.key)}
          />
          {opt.label}
        </label>
      ))}
    </div>
  );
}
