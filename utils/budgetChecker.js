export const checkBudgetLimit = (currentSpending, budgetLimit) => {
      if (currentSpending > budgetLimit) {
        return {
          status: "over_budget",
          message: `Warning: You have exceeded your budget limit by ${currentSpending - budgetLimit}!`,
        };
      }
      return {
        status: "within_budget",
        message: `You are within your budget. Remaining: ${budgetLimit - currentSpending}`,
      };
    };
    