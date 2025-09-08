export default function HomePage() {
  const colors = [
    { name: 'Red', className: 'bg-school-primary-red' },
    { name: 'Blue', className: 'bg-school-primary-blue' },
    { name: 'White', className: 'bg-school-primary-white', textColor: 'text-black', border: true },
    { name: 'Black', className: 'bg-school-primary-black', textColor: 'text-white' },
    { name: 'Light Blue', className: 'bg-school-primary-lightBlue', textColor: 'text-black' },
  ];

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">Brand Colors</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {colors.map((color) => (
          <div
            key={color.name}
            className={`
              ${color.className} 
              ${color.textColor || 'text-white'}
              ${color.border ? 'border border-gray-300' : ''}
              p-6 rounded shadow
            `}
          >
            <p className="text-lg font-semibold">{color.name}</p>
            <p className="text-sm">{color.className.replace('bg-', '')}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
