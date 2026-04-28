const STEPS = ['Placed', 'Confirmed', 'Shipped', 'Delivered'];

const OrderProgressBar = ({ order }) => {
  // Map order state to step index
  const getStep = () => {
    if (order.isDelivered) return 3;
    if (order.isPaid) return 2;
    return 1; // confirmed
  };
  const currentStep = getStep();

  return (
    <div className="w-full py-3">
      <div className="flex items-center justify-between relative">
        {/* Connector line */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-slate-200 dark:bg-slate-700 z-0" />
        <div
          className="absolute top-4 left-0 h-0.5 bg-primary z-0 transition-all duration-700"
          style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
        />
        {STEPS.map((step, i) => (
          <div key={step} className="flex flex-col items-center gap-1.5 z-10">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all duration-300 ${
              i <= currentStep
                ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
            }`}>
              {i < currentStep ? '✓' : i + 1}
            </div>
            <span className={`text-[9px] font-black uppercase tracking-wider ${
              i <= currentStep ? 'text-primary' : 'text-slate-400 dark:text-slate-500'
            }`}>{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderProgressBar;
