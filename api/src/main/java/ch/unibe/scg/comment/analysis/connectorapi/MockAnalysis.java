package ch.unibe.scg.comment.analysis.connectorapi;

import java.util.ArrayList;
import java.util.logging.Logger;

public class MockAnalysis {

    public static AnalysisResult getMockAnalysis(String src, String filepath){
        Logger.getLogger("MockAnalysis").info("Mock Analysis for "+filepath);
        Logger.getLogger("MockAnalysis").info(src);
        ArrayList<AnalysisRange> list = new ArrayList<>();
        list.add(new AnalysisRange(100, 200, new String[]{"Summary", "Test", "A super boring label"}));
        list.add(new AnalysisRange(220, 300, new String[]{"Summary", "A super boring label"}));
        list.add(new AnalysisRange(400, 550, new String[]{"Exception", "Test"}));
        list.add(new AnalysisRange(900, 1400, new String[]{"Code", "A super boring label"}));
        list.add(new AnalysisRange(2000, 2999, new String[]{"2k Code", "Code", "A super boring label"}));
        list.add(new AnalysisRange(4000, 4999, new String[]{"4k Code", "Code"}));
        return new AnalysisResult(0, "success", list);
    }
}
