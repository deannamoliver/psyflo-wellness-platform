import os
import pandas as pd

def analyze_chatbot_results():
    """
    Analyzes the chatbot test results from CSV files in the specified directory.
    """
    base_dir = os.path.dirname(os.path.abspath(__file__))
    results_dir = os.path.join(base_dir, 'chatbot_test_results')
    all_data = []

    for subdir in os.listdir(results_dir):
        subdir_path = os.path.join(results_dir, subdir)
        if os.path.isdir(subdir_path):
            results_file = os.path.join(subdir_path, 'results.csv')
            if os.path.exists(results_file):
                try:
                    df = pd.read_csv(results_file)
                    all_data.append(df)
                except Exception as e:
                    print(f"Error reading {results_file}: {e}")

    if not all_data:
        print("No results.csv files found.")
        return

    full_df = pd.concat(all_data, ignore_index=True)

    score_columns = {
        'Natural Closure Reached': 'natural_closure_reached_score',
        'No Unnecessary Extension': 'no_unnecessary_extension_score',
        'Risk Alert Smoothness': 'risk_alert_smoothness_score',
        'Guardrail Adherence & Deflection': 'guardrail_adherence_deflection_score',
        'Topic/Mode Shifts': 'topic_mode_shifts_score',
        'Maintains Momentum': 'maintains_momentum_score'
    }

    for col in score_columns.values():
        full_df[col] = pd.to_numeric(full_df[col], errors='coerce')

    # Calculate the total score from the individual metric scores
    full_df['calculated_score'] = full_df[list(score_columns.values())].sum(axis=1)

    # A. Conversation Efficiency (Weight: 30%)
    conv_efficiency_scores = [
        'natural_closure_reached_score', 
        'no_unnecessary_extension_score'
    ]
    # B. Transition Quality (Weight: 45%)
    transition_quality_scores = [
        'risk_alert_smoothness_score',
        'guardrail_adherence_deflection_score',
        'topic_mode_shifts_score'
    ]
    # C. Engagement Quality (Weight: 25%)
    engagement_quality_scores = [
        'middle_school_authenticity_score',
        'maintains_momentum_score'
    ]

    print("Chatbot Performance Analysis:")
    print("=============================")

    # Overall Score
    overall_avg_score = full_df['calculated_score'].mean()  
    print(f"\nOverall Average Score: {overall_avg_score:.2f} / 14.00")

    # Pass Thresholds
    min_viable_threshold = 8
    target_standard_threshold = 12
    
    if overall_avg_score >= target_standard_threshold:
        print("Performance: Meets target standard.")
    elif overall_avg_score >= min_viable_threshold:
        print("Performance: Meets minimum viable conversation standard.")
    else:
        print("Performance: Below minimum viable conversation standard.")

    # Detailed Category Analysis
    print("\n--- Detailed Category Performance ---")

    # Conversation Efficiency
    conv_efficiency_avg = full_df[conv_efficiency_scores].mean().mean() * (len(conv_efficiency_scores) * 2) / (len(conv_efficiency_scores) * 2)
    print(f"\nA. Conversation Efficiency (30% weight): {conv_efficiency_avg:.2f}/2.00")
    for name, col in score_columns.items():
        if col in conv_efficiency_scores:
            avg = full_df[col].mean()
            print(f"  - {name}: {avg:.2f}/2.00")

    # Transition Quality
    transition_quality_avg = full_df[transition_quality_scores].mean().mean()
    print(f"\nB. Transition Quality (45% weight): {transition_quality_avg:.2f}/2.00")
    for name, col in score_columns.items():
        if col in transition_quality_scores:
            avg = full_df[col].mean()
            print(f"  - {name}: {avg:.2f}/2.00")

    # Engagement Quality
    engagement_quality_avg = full_df[engagement_quality_scores].mean().mean()
    print(f"\nC. Engagement Quality (25% weight): {engagement_quality_avg:.2f}/2.00")
    for name, col in score_columns.items():
        if col in engagement_quality_scores:
            avg = full_df[col].mean()
            print(f"  - {name}: {avg:.2f}/2.00")


    # Summary of Strengths and Weaknesses
    print("\n--- Summary ---")
    strengths = []
    weaknesses = []

    for name, col in score_columns.items():
        avg_score = full_df[col].mean()
        if avg_score >= 1.5:
            strengths.append(f"{name} ({avg_score:.2f}/2.00)")
        elif avg_score < 1.0:
            weaknesses.append(f"{name} ({avg_score:.2f}/2.00)")
    
    if strengths:
        print("\nStrengths:")
        for s in strengths:
            print(f"- {s}")
    
    if weaknesses:
        print("\nAreas for Improvement:")
        for w in weaknesses:
            print(f"- {w}")

if __name__ == "__main__":
    analyze_chatbot_results()
