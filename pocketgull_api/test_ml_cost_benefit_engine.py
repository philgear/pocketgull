"""
Unit tests for ML Cost-Benefit Analysis Engine (5 Innovations)
Runs natively with standard unittest framework.
"""

import unittest
from src.ml_cost_benefit_engine import (
    MLCostBenefitEngine,
    ITreatmentOptionInput,
    IParetoOptimizeRequest,
    IAdherencePredictionRequest,
    IBanditFeedbackRequest,
    ISirOdeRequest,
    IGcnPharmacogenomicsRequest,
    IFhirGenomicVariant,
)


class TestMLCostBenefitEngine(unittest.TestCase):

    def setUp(self):
        self.engine = MLCostBenefitEngine()
        self.sample_options = [
            ITreatmentOptionInput(
                paradigm="Western",
                name="Prescription Metformin",
                costValue=1,
                effortValue=2,
                dosingFrequencyPerDay=1,
                efficacyDays=7,
                isNatural=False,
            ),
            ITreatmentOptionInput(
                paradigm="Eastern",
                name="Xiao Ke Wan Herbs",
                costValue=4,
                effortValue=4,
                dosingFrequencyPerDay=3,
                efficacyDays=21,
                isNatural=True,
            ),
            ITreatmentOptionInput(
                paradigm="Ayurvedic",
                name="Nisha Amalaki Routine",
                costValue=2,
                effortValue=5,
                dosingFrequencyPerDay=2,
                efficacyDays=30,
                isNatural=True,
            ),
        ]

    def test_pareto_optimize(self):
        req = IParetoOptimizeRequest(options=self.sample_options, costWeight=0.5, speedWeight=0.3, adherenceWeight=0.2)
        res = self.engine.pareto_optimize(req)
        self.assertEqual(len(res.rankedOptions), 3)
        self.assertTrue(len(res.paretoFrontier) >= 1)
        self.assertIn("Prescription Metformin", res.paretoFrontier)

    def test_adherence_prediction(self):
        req = IAdherencePredictionRequest(patientAge=50, workScheduleBusyScore=4, historicalFillRate=0.8, options=self.sample_options)
        res = self.engine.predict_adherence(req)
        self.assertIn("Prescription Metformin", res.predictions)
        self.assertGreater(res.predictions["Prescription Metformin"], res.predictions["Xiao Ke Wan Herbs"])

    def test_bandit_feedback(self):
        req = IBanditFeedbackRequest(clinicianSpecialty="Cardiology", paradigm="Western", action="retained")
        res = self.engine.update_bandit_feedback(req)
        self.assertEqual(res.reward, 1.0)
        self.assertGreater(res.updatedWeights["Western"], 1.25)

    def test_sentinel_sir_ode(self):
        req = ISirOdeRequest(baselineR0=2.5, populationSize=10000, interventionType="Quarantine", treatmentCostDollars=50.0)
        res = self.engine.sentinel_sir_ode(req)
        self.assertLess(res.effectiveR0, 2.5)
        self.assertGreater(res.infectionsAverted, 0)
        self.assertGreater(res.dollarsSaved, 0.0)

    def test_gcn_pharmacogenomics(self):
        variants = [
            IFhirGenomicVariant(geneSymbol="CYP2C19", variantCode="*2/*2", phenotype="Poor"),
            IFhirGenomicVariant(geneSymbol="CYP2D6", variantCode="*4/*4", phenotype="Poor"),
        ]
        req = IGcnPharmacogenomicsRequest(genomicVariants=variants, options=self.sample_options)
        res = self.engine.gcn_pharmacogenomics(req)
        self.assertEqual(len(res.interactionResults), 3)
        self.assertGreater(res.confidenceScore, 0.8)


if __name__ == "__main__":
    unittest.main()
