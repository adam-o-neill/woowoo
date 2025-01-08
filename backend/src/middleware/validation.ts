const validateDateParam = (req: any, res: any, next: Function) => {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ error: "Date parameter is required" });
  }

  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    return res.status(400).json({ error: "Invalid date format" });
  }

  // Optional: Limit date range
  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - 1);
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);

  if (parsedDate < minDate || parsedDate > maxDate) {
    return res
      .status(400)
      .json({ error: "Date must be within one year of current date" });
  }

  next();
};

export { validateDateParam };
