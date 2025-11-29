import { useState } from "react";
import { Page1VehicleInput } from "./components/Page1VehicleInput";
import { Page2ConditionSurvey } from "./components/Page2ConditionSurvey";
import { Page3DataAnimation } from "./components/Page3DataAnimation";
import { Page4Result } from "./components/Page4Result";
import { MarketValueLoadingScreen } from "./components/MarketValueLoadingScreen";
import { Footer } from "./components/Footer";
import { Toaster } from "./components/ui/sonner";
import { VehicleInfo, ConditionData } from "./utils/vehicleData";
import { ExternalMarketData } from "./utils/externalMarketData";
import { getChatGPTValuation } from "./utils/chatgptValuation";

/**
 * MY CAR VALUE - ChatGPT Valuation Engine
 * 
 * Complete 4-page vehicle valuation flow with ChatGPT AI-powered pricing
 */

type Page = "input" | "marketLoading" | "survey" | "loading" | "result";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("input");
  const [vehicleInfo, setVehicleInfo] = useState<VehicleInfo | null>(null);
  const [externalMarketData, setExternalMarketData] = useState<ExternalMarketData | null>(null);
  const [conditionData, setConditionData] = useState<ConditionData | null>(null);
  const [estimatedValue, setEstimatedValue] = useState<number>(0);
  const [showSpecialMessage, setShowSpecialMessage] = useState(false);
  const [specialMessage, setSpecialMessage] = useState<string>("");
  const [aiMarketAnalysis, setAiMarketAnalysis] = useState<string>("");
  const [aiRecommendation, setAiRecommendation] = useState<string>("");
  const [aiConfidence, setAiConfidence] = useState<number>(0);
  const [aiFactors, setAiFactors] = useState<{ positive: string[]; negative: string[] }>({
    positive: [],
    negative: [],
  });

  const handleVehicleSubmit = (info: VehicleInfo) => {
    setVehicleInfo(info);
    setCurrentPage("marketLoading");
  };

  const handleMarketLoadingComplete = (marketData: ExternalMarketData) => {
    setExternalMarketData(marketData);
    console.log("External market data stored:", marketData);
    setCurrentPage("survey");
  };

  const handleConditionSubmit = (condition: ConditionData) => {
    setConditionData(condition);
    setCurrentPage("loading");
  };

  const handleLoadingComplete = async () => {
    if (vehicleInfo && conditionData && externalMarketData) {
      try {
        const result = await getChatGPTValuation({
          vehicleInfo,
          externalMarketData,
          conditionData,
          businessRules: {
            target: "conservative_dealer_buy",
            market: "british_columbia",
            philosophy: "autostyle_rem_pricing",
          },
        });
        
        setEstimatedValue(result.finalPrice);
        setAiMarketAnalysis(result.marketAnalysis);
        setAiRecommendation(result.recommendation);
        setAiConfidence(result.confidence);
        setAiFactors(result.factors);
        
        if (conditionData.additionalDisclosure === "salvage" || conditionData.additionalDisclosure === "fire_flood") {
          setShowSpecialMessage(true);
          setSpecialMessage("This vehicle requires a dealer evaluation due to salvage title or fire/flood damage.");
        } else {
          setShowSpecialMessage(false);
          setSpecialMessage("");
        }
      } catch (error) {
        console.error("ChatGPT valuation error:", error);
        setEstimatedValue(25000);
        setShowSpecialMessage(false);
      }
    }
    setCurrentPage("result");
  };

  const handleStartOver = () => {
    setCurrentPage("input");
    setVehicleInfo(null);
    setConditionData(null);
    setEstimatedValue(0);
    setShowSpecialMessage(false);
    setSpecialMessage("");
    setAiMarketAnalysis("");
    setAiRecommendation("");
    setAiConfidence(0);
    setAiFactors({ positive: [], negative: [] });
  };

  const handleBackToInput = () => {
    setCurrentPage("input");
  };

  return (
    <>
      <div className="min-h-screen flex flex-col bg-white">
        {currentPage === "input" && (
          <>
            <Page1VehicleInput onNext={handleVehicleSubmit} />
            <Footer />
          </>
        )}

        {currentPage === "marketLoading" && vehicleInfo && (
          <MarketValueLoadingScreen 
            vehicleInfo={vehicleInfo}
            onComplete={handleMarketLoadingComplete} 
          />
        )}

        {currentPage === "survey" && (
          <>
            <Page2ConditionSurvey
              onNext={handleConditionSubmit}
              onBack={handleBackToInput}
            />
            <Footer />
          </>
        )}

        {currentPage === "loading" && (
          <Page3DataAnimation onComplete={handleLoadingComplete} />
        )}

        {currentPage === "result" && vehicleInfo && (
          <>
            <Page4Result
              vehicleInfo={vehicleInfo}
              estimatedValue={estimatedValue}
              onStartOver={handleStartOver}
              showSpecialMessage={showSpecialMessage}
              specialMessage={specialMessage}
              aiMarketAnalysis={aiMarketAnalysis}
              aiRecommendation={aiRecommendation}
              aiConfidence={aiConfidence}
              aiFactors={aiFactors}
              carfaxDataSource={externalMarketData ? {
                isRealData: externalMarketData.carfax.isRealData,
                source: externalMarketData.carfax.source
              } : undefined}
            />
            <Footer />
          </>
        )}
      </div>
      <Toaster />
    </>
  );
}