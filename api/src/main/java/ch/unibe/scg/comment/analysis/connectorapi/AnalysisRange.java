package ch.unibe.scg.comment.analysis.connectorapi;

/**
 * Object describing a range with assigned labels
 */
public class AnalysisRange {
    private int from;
    private int to;
    private String[] labels;

    public AnalysisRange(int from, int to, String[] labels) {
        this.from = from;
        this.to = to;
        this.labels = labels;
    }

    public int getFrom() {
        return from;
    }

    public void setFrom(int from) {
        this.from = from;
    }

    public int getTo() {
        return to;
    }

    public void setTo(int to) {
        this.to = to;
    }

    public String[] getLabels() {
        return labels;
    }

    public void setLabels(String[] labels) {
        this.labels = labels;
    }
}
