package com.example.automobile.service.system.model;

import java.time.LocalTime;

public class AppointmentSlot {
    private LocalTime startTime;
    private LocalTime endTime;

    public AppointmentSlot() {
    }

    public AppointmentSlot(LocalTime startTime, LocalTime endTime) {
        this.startTime = startTime;
        this.endTime = endTime;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }
}
