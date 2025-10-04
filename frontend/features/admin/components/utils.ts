export const formatCurrency = (amount: string, currency: string = 'USD') => {
  return `${amount} ${currency}`;
};

export const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
};

export const getPriorityColor = (priority: 'low' | 'normal' | 'high') => {
  switch (priority) {
    case "high":
      return "destructive";
    case "normal":
      return "secondary";
    case "low":
      return "outline";
    default:
      return "secondary";
  }
};
