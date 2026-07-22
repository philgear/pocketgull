from typing import Any, List, Optional
from pydantic import BaseModel, Field
import uuid
from datetime import datetime, timezone

class Coding(BaseModel):
    system: Optional[str] = None
    code: Optional[str] = None
    display: Optional[str] = None

class CodeableConcept(BaseModel):
    coding: List[Coding] = Field(default_factory=list)
    text: Optional[str] = None

class ValueQuantity(BaseModel):
    value: float
    unit: str
    system: str = "http://unitsofmeasure.org"
    code: str

class ObservationComponent(BaseModel):
    code: CodeableConcept
    valueString: Optional[str] = None
    valueQuantity: Optional[ValueQuantity] = None

class Observation(BaseModel):
    resourceType: str = "Observation"
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    status: str = "final"
    code: CodeableConcept
    subject: Optional[dict[str, str]] = None
    effectiveDateTime: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    valueQuantity: Optional[ValueQuantity] = None
    interpretation: List[CodeableConcept] = Field(default_factory=list)
    note: List[dict[str, str]] = Field(default_factory=list)
    component: List[ObservationComponent] = Field(default_factory=list)

class BundleEntry(BaseModel):
    fullUrl: str
    resource: Any  # Can be Observation, Patient, etc.

class Bundle(BaseModel):
    resourceType: str = "Bundle"
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: str = "collection"
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    entry: List[BundleEntry] = Field(default_factory=list)

def create_risk_score_bundle(score: float, risk_level: str, confidence: float, factors: List[str], note: str) -> Bundle:
    """Helper to convert the ML prediction into a valid FHIR R4 Bundle."""
    
    # SNOMED CT / LOINC codes for Clinical Risk Score
    code = CodeableConcept(
        coding=[Coding(system="http://snomed.info/sct", code="407563006", display="Clinical risk assessment (procedure)")],
        text="Clinical Risk Score"
    )
    
    value = ValueQuantity(value=round(score, 3), unit="score", code="{score}")
    
    interpretation = [CodeableConcept(text=risk_level.upper())]
    
    components = [
        ObservationComponent(
            code=CodeableConcept(text="Confidence"),
            valueQuantity=ValueQuantity(value=round(confidence, 3), unit="%", code="%")
        )
    ]
    
    for factor in factors:
        components.append(
            ObservationComponent(
                code=CodeableConcept(text="Contributing Factor"),
                valueString=factor
            )
        )
        
    obs_note = [{"text": note}] if note else []
    
    observation = Observation(
        code=code,
        valueQuantity=value,
        interpretation=interpretation,
        component=components,
        note=obs_note
    )
    
    bundle = Bundle(
        entry=[
            BundleEntry(
                fullUrl=f"urn:uuid:{observation.id}",
                resource=observation
            )
        ]
    )
    
    return bundle


def create_readmission_risk_bundle(
    readmission_prob: float,
    recovery_prob: float,
    risk_tier: str,
    top_drivers: List[str],
    recommended_actions: List[str],
    qaly_gain: float,
    note: str = ""
) -> Bundle:
    """Helper to convert 30-Day Readmission & 90-Day Recovery ML Predictions into a valid FHIR R4 Bundle."""
    code = CodeableConcept(
        coding=[
            Coding(system="http://loinc.org", code="45439-7", display="30 day readmission risk assessment"),
            Coding(system="http://snomed.info/sct", code="407563006", display="Clinical risk assessment")
        ],
        text="30-Day Readmission & 90-Day Recovery Risk Score"
    )
    
    value = ValueQuantity(value=round(readmission_prob, 3), unit="probability", code="{prob}")
    interpretation = [CodeableConcept(text=risk_tier.upper())]
    
    components = [
        ObservationComponent(
            code=CodeableConcept(text="90-Day Functional Recovery Probability"),
            valueQuantity=ValueQuantity(value=round(recovery_prob, 3), unit="probability", code="{prob}")
        ),
        ObservationComponent(
            code=CodeableConcept(text="QALY Gain Estimate"),
            valueQuantity=ValueQuantity(value=round(qaly_gain, 2), unit="QALY", code="QALY")
        )
    ]
    
    for driver in top_drivers:
        components.append(
            ObservationComponent(
                code=CodeableConcept(text="Risk Driver"),
                valueString=driver
            )
        )
        
    for action in recommended_actions:
        components.append(
            ObservationComponent(
                code=CodeableConcept(text="Recommended Preventative Action"),
                valueString=action
            )
        )
        
    obs_note = [{"text": note}] if note else []
    
    observation = Observation(
        code=code,
        valueQuantity=value,
        interpretation=interpretation,
        component=components,
        note=obs_note
    )
    
    return Bundle(
        entry=[
            BundleEntry(
                fullUrl=f"urn:uuid:{observation.id}",
                resource=observation
            )
        ]
    )

