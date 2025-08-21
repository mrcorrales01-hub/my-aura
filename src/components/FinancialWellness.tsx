import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  PiggyBank, 
  CreditCard,
  Target,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  Calculator
} from 'lucide-react';

export default function FinancialWellness() {
  const [stressLevel, setStressLevel] = useState('5');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [monthlyExpenses, setMonthlyExpenses] = useState('');
  const [debt, setDebt] = useState('');
  const [savings, setSavings] = useState('');
  const [financialGoals, setFinancialGoals] = useState(['']);

  const addGoal = () => {
    setFinancialGoals([...financialGoals, '']);
  };

  const updateGoal = (index: number, value: string) => {
    const newGoals = [...financialGoals];
    newGoals[index] = value;
    setFinancialGoals(newGoals);
  };

  const removeGoal = (index: number) => {
    setFinancialGoals(financialGoals.filter((_, i) => i !== index));
  };

  const calculateBudgetHealth = () => {
    const income = parseFloat(monthlyIncome) || 0;
    const expenses = parseFloat(monthlyExpenses) || 0;
    if (income === 0) return 0;
    return Math.max(0, ((income - expenses) / income) * 100);
  };

  const budgetHealth = calculateBudgetHealth();

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-6 w-6 text-primary" />
            <span>Financial Wellness Coach</span>
          </CardTitle>
          <CardDescription>
            AI-powered tools to reduce financial stress and build a healthier relationship with money.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Financial Health Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Budget Health</p>
                <p className="text-2xl font-bold">{Math.round(budgetHealth)}%</p>
              </div>
            </div>
            <Progress value={budgetHealth} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Stress Level</p>
                <p className="text-2xl font-bold">{stressLevel}/10</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Active Goals</p>
                <p className="text-2xl font-bold">{financialGoals.filter(g => g.trim()).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <PiggyBank className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Savings Rate</p>
                <p className="text-2xl font-bold">
                  {monthlyIncome && savings ? 
                    Math.round(((parseFloat(savings) || 0) / (parseFloat(monthlyIncome) || 1)) * 100) : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="assessment" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="assessment">Assessment</TabsTrigger>
          <TabsTrigger value="budget">Budget Helper</TabsTrigger>
          <TabsTrigger value="debt">Debt Reduction</TabsTrigger>
          <TabsTrigger value="recommendations">AI Advice</TabsTrigger>
        </TabsList>

        <TabsContent value="assessment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Financial Stress Assessment</CardTitle>
              <CardDescription>
                Help us understand your financial situation to provide personalized guidance.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="monthly-income">Monthly Income ($)</Label>
                  <Input
                    id="monthly-income"
                    type="number"
                    placeholder="3000"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="monthly-expenses">Monthly Expenses ($)</Label>
                  <Input
                    id="monthly-expenses"
                    type="number"
                    placeholder="2500"
                    value={monthlyExpenses}
                    onChange={(e) => setMonthlyExpenses(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="total-debt">Total Debt ($)</Label>
                  <Input
                    id="total-debt"
                    type="number"
                    placeholder="15000"
                    value={debt}
                    onChange={(e) => setDebt(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="savings">Current Savings ($)</Label>
                  <Input
                    id="savings"
                    type="number"
                    placeholder="5000"
                    value={savings}
                    onChange={(e) => setSavings(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="stress-level">Financial Stress Level (1-10)</Label>
                <Select value={stressLevel} onValueChange={setStressLevel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(level => (
                      <SelectItem key={level} value={level.toString()}>
                        {level} - {level <= 3 ? 'Low' : level <= 6 ? 'Moderate' : level <= 8 ? 'High' : 'Severe'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Financial Goals</Label>
                <div className="space-y-2">
                  {financialGoals.map((goal, index) => (
                    <div key={index} className="flex space-x-2">
                      <Input
                        placeholder="e.g., Save $1000 for emergency fund"
                        value={goal}
                        onChange={(e) => updateGoal(index, e.target.value)}
                      />
                      {financialGoals.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeGoal(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button variant="outline" onClick={addGoal} size="sm">
                    Add Goal
                  </Button>
                </div>
              </div>

              <Button className="w-full">
                <Calculator className="mr-2 h-4 w-4" />
                Generate Financial Wellness Plan
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budget" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Smart Budget Planner</CardTitle>
              <CardDescription>
                AI-recommended budget based on your income and goals.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Monthly Income</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-green-600">
                        ${monthlyIncome || '0'}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Available to Save</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-blue-600">
                        ${Math.max(0, (parseFloat(monthlyIncome) || 0) - (parseFloat(monthlyExpenses) || 0))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {monthlyIncome && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Recommended 50/30/20 Budget</h3>
                    <div className="grid gap-4 md:grid-cols-3">
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">50%</div>
                            <div className="text-sm text-muted-foreground">Needs</div>
                            <div className="font-medium">${Math.round((parseFloat(monthlyIncome) || 0) * 0.5)}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Rent, utilities, groceries
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">30%</div>
                            <div className="text-sm text-muted-foreground">Wants</div>
                            <div className="font-medium">${Math.round((parseFloat(monthlyIncome) || 0) * 0.3)}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Entertainment, dining out
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">20%</div>
                            <div className="text-sm text-muted-foreground">Savings</div>
                            <div className="font-medium">${Math.round((parseFloat(monthlyIncome) || 0) * 0.2)}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Emergency fund, investments
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="debt" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Debt Reduction Strategy</CardTitle>
              <CardDescription>
                AI-powered plan to reduce your debt and financial stress.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {debt && parseFloat(debt) > 0 ? (
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Your Debt Overview</h3>
                    <div className="text-2xl font-bold text-red-600">${debt}</div>
                    <p className="text-sm text-muted-foreground">Total debt amount</p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center space-x-2">
                          <TrendingDown className="h-5 w-5 text-blue-500" />
                          <span>Snowball Method</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-2">
                          Pay minimum on all debts, focus extra payments on smallest balance first.
                        </p>
                        <Badge variant="outline">Motivation focused</Badge>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center space-x-2">
                          <Calculator className="h-5 w-5 text-green-500" />
                          <span>Avalanche Method</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-2">
                          Pay minimum on all debts, focus extra payments on highest interest rate first.
                        </p>
                        <Badge variant="outline">Math optimized</Badge>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-2">AI Recommendation</h4>
                    <p className="text-sm">
                      Based on your financial profile, we recommend starting with the <strong>Snowball Method</strong> 
                      to build momentum and reduce financial stress. Once you gain confidence, consider switching to 
                      the Avalanche Method to save on interest.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <h3 className="text-lg font-semibold mb-2">Great news!</h3>
                  <p className="text-muted-foreground">
                    You don't have any debt listed. Focus on building your emergency fund and investing for the future.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lightbulb className="h-5 w-5" />
                <span>AI Financial Recommendations</span>
              </CardTitle>
              <CardDescription>
                Personalized advice based on your financial situation and stress level.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {parseInt(stressLevel) >= 7 && (
                  <div className="p-4 border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-red-800 dark:text-red-200">High Financial Stress Detected</h4>
                        <p className="text-sm text-red-700 dark:text-red-300">
                          Consider speaking with a financial counselor or using our crisis support resources.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <PiggyBank className="h-6 w-6 text-green-500 mt-1" />
                        <div>
                          <h4 className="font-semibold">Emergency Fund Priority</h4>
                          <p className="text-sm text-muted-foreground">
                            Aim for $1,000 emergency fund first, then 3-6 months of expenses.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <CreditCard className="h-6 w-6 text-blue-500 mt-1" />
                        <div>
                          <h4 className="font-semibold">Track Every Dollar</h4>
                          <p className="text-sm text-muted-foreground">
                            Use a budgeting app to monitor spending and identify areas to cut back.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <Target className="h-6 w-6 text-purple-500 mt-1" />
                        <div>
                          <h4 className="font-semibold">Automate Savings</h4>
                          <p className="text-sm text-muted-foreground">
                            Set up automatic transfers to make saving effortless and consistent.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <Lightbulb className="h-6 w-6 text-yellow-500 mt-1" />
                        <div>
                          <h4 className="font-semibold">Increase Income</h4>
                          <p className="text-sm text-muted-foreground">
                            Consider side hustles, skill development, or asking for a raise.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}