# NutriWise End-to-End Workflow Documentation

## 🎯 Architecture Overview

**LLM (Gemini) Tasks**: Natural language understanding, creative recipe generation, meal plan structuring  
**Deterministic Code Tasks**: Pricing, nutrition calculation, validation, optimization

---

## 📋 Component 1: User Onboarding & Profile Setup

### Data Collection

#### Basic Demographics
- **Age** (13-120 years)
- **Gender** (Male/Female/Other)
- **Weight** (kg)
- **Height** (cm)

#### Activity & Goals
- **Activity Level**: Sedentary, Lightly Active, Moderately Active, Very Active, Extra Active
- **Dietary Goal**: Lose Weight, Maintain Weight, Gain Weight, Build Muscle, Improve Energy
- **Target Weight** (optional)
- **Timeline** (weeks to reach goal)

#### Dietary Preferences
- **Preferences**: Vegetarian, Vegan, Non-Vegetarian, Pescatarian, Gluten-Free, Dairy-Free, Keto, Paleo, Low-Carb, High-Protein
- **Allergies**: List of allergens (nuts, dairy, shellfish, etc.)
- **Intolerances**: List of intolerances (lactose, gluten, etc.)
- **Preferred Cuisines**: Indian, Italian, Chinese, etc.
- **Disliked Foods**: Foods user doesn't like

#### Custom Targets (Optional)
- Custom calorie target
- Custom macro ratios (protein/carbs/fat)

#### Budget
- Weekly budget in INR
- Region for pricing

### Profile Calculation (DETERMINISTIC CODE)

```python
# 1. Calculate BMR (Basal Metabolic Rate)
BMR = 10 × weight_kg + 6.25 × height_cm - 5 × age + gender_factor

# 2. Calculate TDEE (Total Daily Energy Expenditure)
TDEE = BMR × activity_multiplier

# 3. Calculate Calorie Target
Calorie Target = TDEE + goal_adjustment

# 4. Calculate Macro Targets
Protein (g) = (Calories × protein_ratio) / 4
Carbs (g) = (Calories × carbs_ratio) / 4
Fat (g) = (Calories × fat_ratio) / 9

# 5. Calculate BMI
BMI = weight_kg / (height_m)²
```

**All calculations are DETERMINISTIC - no LLM involved**

---

## 💰 Component 2: Pricing & Budget Analysis

### Database File Analysis

**Source**: `dataset/Indian_Global_Foods_Nutrition_Prices_100items.csv`

### Pricing Service (DETERMINISTIC CODE)

```python
class PricingAnalyzer:
    - Load pricing data from CSV
    - Calculate ingredient prices per 100g
    - Calculate recipe costs from ingredients
    - Calculate meal plan total costs
    - Validate budget compliance
    - Suggest budget ranges
```

### Pricing Calculations

1. **Ingredient Price Lookup**
   - Exact match by name
   - Partial match fallback
   - Category-based estimation

2. **Recipe Cost Calculation**
   ```
   Recipe Cost = Σ(ingredient_quantity × price_per_unit)
   Cost per Serving = Recipe Cost / servings
   ```

3. **Meal Plan Cost**
   ```
   Daily Cost = Σ(meal_costs)
   Weekly Cost = Daily Cost × 7
   ```

4. **Budget Validation**
   ```
   Within Budget = Total Cost ≤ Budget × (1 + tolerance)
   Utilization = (Total Cost / Budget) × 100%
   ```

**All pricing is DETERMINISTIC - strict calculations**

---

## 🥗 Component 3: Nutrition Constraints Setup

### Automatic Calculation (DETERMINISTIC)

Based on user profile:
- BMR → TDEE → Calorie Target
- Macro ratios based on goal
- Micronutrient targets

### Custom Override

Users can set:
- Custom calorie target
- Custom macro ratios

### Constraint Structure

```json
{
  "daily_calories": 2000,
  "daily_protein_g": 150,
  "daily_carbs_g": 200,
  "daily_fat_g": 67,
  "dietary_restrictions": ["VEGETARIAN", "GLUTEN_FREE"],
  "allergies": ["NUTS", "SHELLFISH"],
  "intolerances": ["LACTOSE"],
  "preferred_cuisines": ["INDIAN", "ITALIAN"],
  "disliked_foods": ["OKRA", "BITTER_GOURD"]
}
```

**All nutrition calculations are DETERMINISTIC**

---

## 🔄 Component 4: Structured System Pipeline

### Complete Workflow

```
┌─────────────────────────────────────────────────────────┐
│ 1. USER ONBOARDING (Deterministic)                      │
│    - Collect profile data                                │
│    - Calculate BMR, TDEE, calories, macros              │
│    - Save to database                                    │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 2. PARSE USER REQUEST (LLM)                              │
│    - Natural language: "I want to lose 5kg in 2 months"│
│    - Extract: goal, calories, preferences, etc.         │
│    - Return structured data                             │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 3. CREATE USER VECTOR (Deterministic)                    │
│    - Nutrition vector from preferences                  │
│    - 8-dimensional vector (calories, macros, micros)    │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 4. FETCH RECIPES & CREATE VECTORS (Deterministic)       │
│    - Get recipes from database                          │
│    - Create nutrition vectors for each                  │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 5. COSINE SIMILARITY MATCHING (Deterministic)            │
│    - Calculate similarity scores                        │
│    - Get top 20 similar recipes                         │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 6. GENERATE RECIPE SUGGESTIONS (LLM)                    │
│    - Creative recipe ideas                              │
│    - Based on constraints                               │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 7. GENERATE MEAL PLAN (LLM)                             │
│    - Create day-by-day structure                        │
│    - Assign meals to days                               │
│    - Use recommended recipes                            │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 8. VALIDATE NUTRITION (Deterministic)                    │
│    - Calculate actual nutrition                         │
│    - Compare to targets                                 │
│    - Check compliance                                   │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 9. VALIDATE PRICING (Deterministic)                      │
│    - Calculate actual costs                             │
│    - Compare to budget                                  │
│    - Check compliance                                   │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 10. OPTIMIZE IF NEEDED (Deterministic)                   │
│     - Adjust portion sizes                              │
│     - Replace expensive ingredients                     │
│     - Re-validate                                       │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 11. RETURN MEAL PLAN                                    │
│     - Validated meal plan                               │
│     - Nutrition validation results                      │
│     - Pricing validation results                        │
└─────────────────────────────────────────────────────────┘
```

---

## 🤖 Component 5: LLM vs Deterministic Code Tasks

### LLM Tasks (Gemini)

#### ✅ Suitable for LLM:

1. **Natural Language Understanding**
   - Parse user requests: "I want vegetarian meals for weight loss"
   - Extract structured data from free text
   - Understand context and intent

2. **Creative Recipe Generation**
   - Generate new recipe ideas
   - Suggest ingredient combinations
   - Create recipe descriptions

3. **Meal Plan Structuring**
   - Organize meals across days
   - Create variety and balance
   - Suggest meal timing

4. **Nutrition Advice**
   - Answer user questions
   - Provide explanations
   - Give recommendations

5. **Recipe Recommendations**
   - Suggest recipes based on preferences
   - Explain why recipes fit
   - Provide alternatives

#### ❌ NOT Suitable for LLM:

1. **Price Calculations** - Must be exact
2. **Nutrition Calculations** - Must be accurate
3. **Budget Validation** - Must be precise
4. **Allergy Checking** - Must be 100% correct
5. **Macro Calculations** - Must follow formulas
6. **BMI/BMR/TDEE** - Must use scientific formulas

### Deterministic Code Tasks

#### ✅ Must Use Code:

1. **Pricing Calculations**
   ```python
   # DETERMINISTIC
   ingredient_price = quantity_g × (price_per_kg / 1000)
   recipe_cost = Σ(ingredient_prices)
   ```

2. **Nutrition Calculations**
   ```python
   # DETERMINISTIC
   BMR = 10 × weight + 6.25 × height - 5 × age + gender_factor
   TDEE = BMR × activity_multiplier
   Protein (g) = (calories × ratio) / 4
   ```

3. **Validation**
   ```python
   # DETERMINISTIC
   within_budget = actual_cost ≤ budget
   nutrition_valid = |actual - target| ≤ tolerance
   allergy_compliant = no_allergens in ingredients
   ```

4. **Vector Similarity**
   ```python
   # DETERMINISTIC
   similarity = cosine_similarity(user_vector, recipe_vector)
   ```

5. **Optimization**
   ```python
   # DETERMINISTIC
   scale_factor = target_calories / actual_calories
   adjusted_portion = original_portion × scale_factor
   ```

---

## 📊 Task Separation Summary

| Task | LLM or Code | Reason |
|------|-------------|--------|
| Parse user request | **LLM** | Natural language understanding |
| Calculate BMR/TDEE | **Code** | Scientific formula, must be exact |
| Calculate calories | **Code** | Mathematical calculation |
| Calculate macros | **Code** | Mathematical calculation |
| Calculate prices | **Code** | Financial calculation, must be exact |
| Generate recipe ideas | **LLM** | Creative task |
| Find similar recipes | **Code** | Cosine similarity, mathematical |
| Generate meal plan | **LLM** | Creative structuring |
| Validate nutrition | **Code** | Must be accurate |
| Validate pricing | **Code** | Must be exact |
| Check allergies | **Code** | Safety critical, must be 100% correct |
| Optimize meal plan | **Code** | Mathematical optimization |
| Provide advice | **LLM** | Explanatory, creative |

---

## 🔧 Implementation Details

### API Endpoints

#### Onboarding
- `POST /api/onboarding/complete` - Complete profile setup
- `GET /api/onboarding/profile` - Get user profile
- `POST /api/onboarding/natural-language` - Parse natural language

#### Meal Planning
- `POST /api/meal-plans` - Generate meal plan (uses full pipeline)
- `GET /api/meal-plans` - List user's meal plans
- `GET /api/meal-plans/{id}` - Get meal plan details

### Service Classes

1. **OnboardingService** - Profile calculations (DETERMINISTIC)
2. **PricingAnalyzer** - Price calculations (DETERMINISTIC)
3. **NutritionValidator** - Nutrition validation (DETERMINISTIC)
4. **LLMInteractionService** - LLM tasks (CREATIVE)
5. **MealPlanningPipeline** - Orchestrates workflow

---

## 🎯 Best Practices

### LLM Usage
- ✅ Use for understanding, creativity, explanations
- ✅ Always validate LLM output with deterministic code
- ✅ Provide clear prompts with constraints
- ❌ Never use for calculations that must be exact

### Deterministic Code
- ✅ Use for all calculations (pricing, nutrition, validation)
- ✅ Use for safety-critical checks (allergies)
- ✅ Use for optimization
- ✅ Always validate LLM-generated data

### Workflow
1. User input → LLM parses → Code validates
2. Code calculates constraints → LLM generates → Code validates
3. Code optimizes if needed → Code validates again

---

## 📝 Example Flow

### User Request: "I want to lose 5kg in 2 months with vegetarian meals"

1. **LLM Parses** (Gemini):
   ```json
   {
     "dietary_goal": "lose_weight",
     "dietary_preferences": ["vegetarian"],
     "timeline_weeks": 8,
     "target_weight_loss_kg": 5
   }
   ```

2. **Code Calculates** (Deterministic):
   - Current weight: 70kg → Target: 65kg
   - Weekly loss: 5kg / 8 weeks = 0.625kg/week
   - Calorie deficit: 0.625 × 7700 / 7 = 687 cal/day
   - Calorie target: TDEE - 687

3. **Code Creates Vector** (Deterministic):
   - User nutrition vector from calculated targets

4. **Code Finds Similar Recipes** (Deterministic):
   - Cosine similarity → Top 20 vegetarian recipes

5. **LLM Generates Meal Plan** (Gemini):
   - Creates 7-day vegetarian meal plan
   - Uses recommended recipes
   - Ensures variety

6. **Code Validates** (Deterministic):
   - Nutrition: ✅ Within 10% of targets
   - Pricing: ✅ Within budget
   - Allergies: ✅ Compliant

7. **Return Result**:
   - Validated meal plan
   - Validation reports
   - Recommendations

---

This architecture ensures **accuracy** (deterministic code) while leveraging **creativity** (LLM) for user experience.

