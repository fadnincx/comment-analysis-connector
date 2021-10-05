package ch.unibe.scg.comment.analysis.connectorapi;

import java.util.List;

public class AnalysisResult {

    private int code;
    private String msg;
    private List<AnalysisRange> result;

    public AnalysisResult(int code, String msg, List<AnalysisRange> result) {
        this.code = code;
        this.msg = msg;
        this.result = result;
    }

    public int getCode() {
        return code;
    }

    public void setCode(int code) {
        this.code = code;
    }

    public String getMsg() {
        return msg;
    }

    public void setMsg(String msg) {
        this.msg = msg;
    }

    public List<AnalysisRange> getResult() {
        return result;
    }

    public void setResult(List<AnalysisRange> result) {
        this.result = result;
    }
}
