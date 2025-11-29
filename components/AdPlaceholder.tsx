interface AdPlaceholderProps {
  className?: string;
  width?: string;
  height?: string;
  label?: string;
  showBorder?: boolean;
}

export function AdPlaceholder({ 
  className = "", 
  width = "300px", 
  height = "250px",
  label = "Advertisement",
  showBorder = false
}: AdPlaceholderProps) {
  return (
    <div 
      className={`relative flex items-center justify-center ${showBorder ? 'border border-gray-200 rounded' : ''} ${className}`}
      style={{ width, height }}
    >
      <div className="text-center text-gray-400 text-sm">
        <div className="mb-2">{label}</div>
        <div className="text-xs text-gray-300">Google AdSense</div>
      </div>
    </div>
  );
}