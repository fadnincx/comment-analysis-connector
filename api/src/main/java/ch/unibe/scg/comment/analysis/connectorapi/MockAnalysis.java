package ch.unibe.scg.comment.analysis.connectorapi;

import java.util.ArrayList;
import java.util.logging.Logger;

public class MockAnalysis {

    public static AnalysisResult getMockAnalysis(String src, String filepath){
        Logger.getLogger("MockAnalysis").info("Mock Analysis for "+filepath);
        Logger.getLogger("MockAnalysis").info(src);
        ArrayList<AnalysisRange> list = new ArrayList<>();
        list.add(new AnalysisRange(100, 200, new String[]{"Summary", "Test"}));
        list.add(new AnalysisRange(220, 300, new String[]{"Summary"}));
        list.add(new AnalysisRange(400, 550, new String[]{"Exception"}));

        return new AnalysisResult(0, "success", list);
    }
}
