package com.beyco.app.models;

public class CalificacionRequest {
    private String alumnoCurp;
    private int cursoId;
    private double evaluacionInicial;
    private double evaluacionFinal;
    private double examenPractico;
    private double promedio;
    private String resultado;
    private String observaciones;

    // Constructor vacío
    public CalificacionRequest() {}

    // Constructor completo
    public CalificacionRequest(String alumnoCurp, int cursoId, double evaluacionInicial, 
                              double evaluacionFinal, double examenPractico, double promedio, 
                              String resultado, String observaciones) {
        this.alumnoCurp = alumnoCurp;
        this.cursoId = cursoId;
        this.evaluacionInicial = evaluacionInicial;
        this.evaluacionFinal = evaluacionFinal;
        this.examenPractico = examenPractico;
        this.promedio = promedio;
        this.resultado = resultado;
        this.observaciones = observaciones;
    }

    // Getters y Setters
    public String getAlumnoCurp() { return alumnoCurp; }
    public void setAlumnoCurp(String alumnoCurp) { this.alumnoCurp = alumnoCurp; }

    public int getCursoId() { return cursoId; }
    public void setCursoId(int cursoId) { this.cursoId = cursoId; }

    public double getEvaluacionInicial() { return evaluacionInicial; }
    public void setEvaluacionInicial(double evaluacionInicial) { this.evaluacionInicial = evaluacionInicial; }

    public double getEvaluacionFinal() { return evaluacionFinal; }
    public void setEvaluacionFinal(double evaluacionFinal) { this.evaluacionFinal = evaluacionFinal; }

    public double getExamenPractico() { return examenPractico; }
    public void setExamenPractico(double examenPractico) { this.examenPractico = examenPractico; }

    public double getPromedio() { return promedio; }
    public void setPromedio(double promedio) { this.promedio = promedio; }

    public String getResultado() { return resultado; }
    public void setResultado(String resultado) { this.resultado = resultado; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }

    @Override
    public String toString() {
        return "CalificacionRequest{" +
                "alumnoCurp='" + alumnoCurp + '\'' +
                ", cursoId=" + cursoId +
                ", evaluacionInicial=" + evaluacionInicial +
                ", evaluacionFinal=" + evaluacionFinal +
                ", examenPractico=" + examenPractico +
                ", promedio=" + promedio +
                ", resultado='" + resultado + '\'' +
                ", observaciones='" + observaciones + '\'' +
                '}';
    }
}