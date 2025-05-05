package com.example.automobile.service.system.service;

import com.example.automobile.service.system.entity.*;
import com.example.automobile.service.system.exception.AppointmentConflictException;
import com.example.automobile.service.system.model.*;
import com.example.automobile.service.system.repository.*;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AppointmentService {
    @Autowired
    AppointmentRepository appointmentRepository;
    @Autowired
    HolidayRepository holidayRepository;
    @Autowired
    VehicleTypeRepository vehicleTypeRepository;
    @Autowired
    VehicleRepository vehicleRepository;
    @Autowired
    VehicleMakeRepository vehicleMakeRepository;
    @Autowired
    VehicleModelRepository vehicleModelRepository;
    @Autowired
    UserAccountRepository roleRepository;
    @Autowired
    CustomerRepository customerRepository;
    @Autowired
    ServiceFeeRepository serviceFeeRepository;

    public static class ResourceNotFoundException extends RuntimeException {
        public ResourceNotFoundException(String message) {
            super(message);
        }
    }

    @Value("${appointment.slot.granularity.minutes:15}")
    private int slotGranularityMinutes;

    @Value("${appointment.working.start.time:09:00}")
    private String workingStartTimeStr;

    @Value("${appointment.working.end.time:17:00}")
    private String workingEndTimeStr;

    private LocalTime getWorkingStartTime() { return LocalTime.parse(workingStartTimeStr); }
    private LocalTime getWorkingEndTime() { return LocalTime.parse(workingEndTimeStr); }

    public Boolean checkIsHoliday(LocalDate date){
        Holiday holiday=holidayRepository.findByDate(date);
        return holiday != null;
    }

    public List<Holiday> getHolidays(){
        return holidayRepository.findAll();
    }

    public Holiday setHolidays(Holiday holiday){
        return holidayRepository.save(holiday);
    }

    public String removeHolidays(Long id){
        try {
            holidayRepository.deleteById(id);
            return "Holiday removed from database";
        }catch (Exception e){
            return e.toString();
        }
    }
    public Holiday updateHoliday(Long id,Holiday holiday){
        Holiday existingHoliday = holidayRepository.findById(id)
                .orElseThrow(() -> new BillingService.ResourceNotFoundException("Holiday not found with id: " + id));

        // Update the fields
        existingHoliday.setDate(holiday.getDate());
        existingHoliday.setStartTime(holiday.getStartTime());
        existingHoliday.setEndTime(holiday.getEndTime());

        // Save and return the updated entity
        return holidayRepository.save(existingHoliday);
    }

    /*public List<AvailableTimeSlot> getAvailableTime(String date,String dayStartTime, String dayEndTime, int durationInMinutes){
        if(!checkIsHoliday(date)){
            List<Appointment> appointments=appointmentRepository.findByDate(date);
            List<AvailableTimeSlot> availableSlots = new ArrayList<>();
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HHmm");

            LocalTime start = LocalTime.parse(dayStartTime, formatter);
            LocalTime endOfDay = LocalTime.parse(dayEndTime, formatter);

            while (start.plusMinutes(durationInMinutes).isBefore(endOfDay.plusSeconds(1))) {
                LocalTime slotEnd = start.plusMinutes(durationInMinutes);

                boolean overlaps = false;

                for (Appointment a : appointments) {
                    LocalTime appStart = LocalTime.parse(a.getStartTime(), formatter);
                    LocalTime appEnd = LocalTime.parse(a.getEndTime(), formatter);


                    if (start.isBefore(appEnd) && slotEnd.isAfter(appStart)) {
                        overlaps = true;
                        break;
                    }
                }

                if (!overlaps) {
                    availableSlots.add(new AvailableTimeSlot(
                            start.format(formatter),
                            slotEnd.format(formatter)
                    ));
                }

                start = slotEnd;
            }

            return availableSlots;
        }else{
            return null;
        }
    }*/

    public ResponseEntity<String> addAppointment(Appointment appointment){
        try {
            appointmentRepository.save(appointment);
            return ResponseEntity.ok(appointment.getId().toString());
        }catch (Exception e){
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.toString());
        }
    }
    public List<Appointment> filterAppointments(AppointmentFilter filters) {
        Specification<Appointment> spec = (root, query, cb) -> {
            Predicate p = cb.conjunction(); // Start with an always-true predicate

            if (filters.getStartDate() != null) {
                p = cb.and(p, cb.greaterThanOrEqualTo(root.get("date"), filters.getStartDate()));
            }
            if (filters.getEndDate() != null) {
                p = cb.and(p, cb.lessThanOrEqualTo(root.get("date"), filters.getEndDate()));
            }
            if (filters.getStatus() != null) {
                p = cb.and(p, cb.equal(root.get("status"), filters.getStatus()));
            }
            // Join with Vehicle and Customer for filtering by their attributes
            if (filters.getVehicleId() != null || filters.getChassisNo() != null || filters.getCustomerName() != null) {
                Join<Appointment, Vehicle> vehicleJoin = root.join("vehicle", JoinType.LEFT); // LEFT JOIN if vehicle might be null (shouldn't be based on entity)
                if (filters.getVehicleId() != null && !filters.getVehicleId().isBlank()) {
                    p = cb.and(p, cb.like(cb.lower(vehicleJoin.get("vehicleId")), "%" + filters.getVehicleId().toLowerCase() + "%"));
                }
                if (filters.getChassisNo() != null && !filters.getChassisNo().isBlank()) {
                    p = cb.and(p, cb.like(cb.lower(vehicleJoin.get("chassisNo")), "%" + filters.getChassisNo().toLowerCase() + "%"));
                }
                if (filters.getCustomerName() != null && !filters.getCustomerName().isBlank()) {
                    Join<Vehicle, Customer> customerJoin = vehicleJoin.join("owner", JoinType.LEFT);
                    p = cb.and(p, cb.like(cb.lower(customerJoin.get("name")), "%" + filters.getCustomerName().toLowerCase() + "%"));
                }
            }

            // Order by date and start time
            query.orderBy(cb.asc(root.get("date")), cb.asc(root.get("startTime")));

            return p;
        };
        return appointmentRepository.findAll(spec);
    }
    public List<AppointmentSlot> getAvailableSlots(LocalDate date, int requiredDurationMinutes) {
        List<AppointmentSlot> availableSlots = new ArrayList<>();
        LocalTime potentialStartTime = getWorkingStartTime();
        LocalTime workingEndTime = getWorkingEndTime();

        // Fetch all existing non-cancelled appointments and holidays for the day
        List<Appointment> existingAppointments = appointmentRepository.findByDate(date).stream()
                .filter(a -> a.getStatus() != AppointmentStatus.CANCELLED)
                .toList();
        List<Holiday> holidays = holidayRepository.findAllByDate(date);

        while (!potentialStartTime.isAfter(workingEndTime)) {
            LocalTime potentialEndTime = potentialStartTime.plusMinutes(requiredDurationMinutes);


            if (potentialEndTime.isAfter(workingEndTime)) {
                break;
            }

            boolean isSlotAvailable = true;


            for (Holiday holiday : holidays) {
                LocalTime holidayStart = holiday.getStartTime() != null ? holiday.getStartTime() : LocalTime.MIN;
                LocalTime holidayEnd = holiday.getEndTime() != null ? holiday.getEndTime() : LocalTime.MAX;

                if (potentialStartTime.isBefore(holidayEnd) && potentialEndTime.isAfter(holidayStart)) {
                    isSlotAvailable = false;
                    break;
                }
            }

            // Check against existing appointments if not already conflicting with holiday
            if (isSlotAvailable) {
                for (Appointment existing : existingAppointments) {
                    if (potentialStartTime.isBefore(existing.getEndTime()) && potentialEndTime.isAfter(existing.getStartTime())) {
                        isSlotAvailable = false;
                        break;
                    }
                }
            }


            if (isSlotAvailable) {
                availableSlots.add(new AppointmentSlot(potentialStartTime, potentialEndTime));
            }

            potentialStartTime = potentialStartTime.plusMinutes(slotGranularityMinutes);
        }

        return availableSlots;
    }


    public List<Appointment> getAppointmentsForUser(String username) {
        UserAccount user = roleRepository.findByUsername(username);
        Customer customer = customerRepository.findByNicNo(username);
        List<Vehicle> vehicles = vehicleRepository.findByOwner(customer);
        if (vehicles.isEmpty()) {
            return Collections.emptyList();
        }

        return vehicles.stream()
                .flatMap(vehicle -> appointmentRepository.findByVehicle(vehicle).stream())
                .sorted((a1, a2) -> {
                    int dateCompare = a1.getDate().compareTo(a2.getDate());
                    return dateCompare != 0 ? dateCompare : a1.getStartTime().compareTo(a2.getStartTime());
                })
                .collect(Collectors.toList());

    }

    private Customer findOrCreateCustomer(AppointmentBookingRequest bookingRequest, UserAccount user) {
        Customer customerOpt = customerRepository.findByNicNo(bookingRequest.getCustomerIdentifier());
        if (customerOpt==null) {
            customerOpt = customerRepository.findByPhoneNo(bookingRequest.getCustomerIdentifier());
        }

        if (customerOpt!=null) {
            customerOpt.setPhoneNo(bookingRequest.getCustomerPhoneNo());
            return customerOpt;
        } else {

            Customer newCustomer = new Customer();
            newCustomer.setName(bookingRequest.getCustomerName());
            newCustomer.setAddress(bookingRequest.getCustomerAddress());
            newCustomer.setPhoneNo(bookingRequest.getCustomerPhoneNo());

            if (isPhoneNumber(bookingRequest.getCustomerIdentifier())) {
                if (customerRepository.existsByPhoneNo(bookingRequest.getCustomerIdentifier())) {
                    throw new IllegalArgumentException("Phone number already exists.");
                }
                newCustomer.setPhoneNo(bookingRequest.getCustomerIdentifier());
            } else {
                if (customerRepository.existsByNicNo(bookingRequest.getCustomerIdentifier())) {
                    throw new IllegalArgumentException("NIC number already exists.");
                }
                newCustomer.setNicNo(bookingRequest.getCustomerIdentifier());
            }
            return customerRepository.save(newCustomer);
        }
    }


    private Vehicle findOrCreateVehicle(AppointmentBookingRequest bookingRequest, Customer customer) {
        Vehicle vehicleOpt = vehicleRepository.findByVehicleId(bookingRequest.getVehicleIdentifier());
        if (vehicleOpt==null) {
            vehicleOpt = vehicleRepository.findByChassisNo(bookingRequest.getVehicleIdentifier());
        }

        if (vehicleOpt!=null) {
            return vehicleOpt;
        } else {
            if (bookingRequest.getMake() == null || bookingRequest.getModel() == null || bookingRequest.getYear() == null) {
                throw new IllegalArgumentException("Vehicle not found, and required details (make, model, year) missing for creation.");
            }

            if (vehicleRepository.existsByVehicleId(bookingRequest.getVehicleIdentifier())) {
                throw new IllegalArgumentException("Vehicle ID already exists.");
            }
            String chassisNo = bookingRequest.getVehicleIdentifier();
            String vehicleId = bookingRequest.getVehicleIdentifier();
            if (isChassisNumber(bookingRequest.getVehicleIdentifier())) {
                vehicleId = "TEMP_" + System.currentTimeMillis();
            }


            Vehicle newVehicle = new Vehicle();
            newVehicle.setOwner(customer);
            newVehicle.setYear(bookingRequest.getYear());
            newVehicle.setVehicleId(vehicleId);
            newVehicle.setChassisNo(chassisNo);


            VehicleMake make = vehicleMakeRepository.findByName(bookingRequest.getMake());
            VehicleModel model = vehicleModelRepository.findByNameAndVehicleMake(bookingRequest.getModel(), make);
            newVehicle.setModel(model);

            return vehicleRepository.save(newVehicle);
        }
    }


    //
    public Appointment bookAppointment(AppointmentBookingRequest bookingRequest, String username) {
        // 1. Validate User & Find Customer
        UserAccount user = roleRepository.findByUsername(username);
        Customer customer = findOrCreateCustomer(bookingRequest, user);

        // 2. Find or Create Vehicle
        Vehicle vehicle = findOrCreateVehicle(bookingRequest, customer);

        // 3. Calculate Required Duration based on selected services
        int requiredDuration = calculateTotalDuration(vehicle.getModel(), bookingRequest.getSelectedServiceDescriptions());

        // 4. Validate Time Slot and Duration
        LocalTime startTime = bookingRequest.getStartTime();
        LocalTime endTime = startTime.plusMinutes(requiredDuration);
        validateAppointmentTime(bookingRequest.getDate(), startTime, endTime);

        // 5. Process Advance Payment (Simulated)
        String paymentTransactionId = "SIM_PAY_" + System.currentTimeMillis(); // Simulated ID

        // 6. Create and Save Appointment
        Appointment appointment = new Appointment();
        appointment.setDate(bookingRequest.getDate());
        appointment.setStartTime(startTime);
        appointment.setEndTime(endTime);
        appointment.setVehicle(vehicle);
        appointment.setAdvanceFeePaid(bookingRequest.getAdvanceFee());
        appointment.setPaymentTransactionId(paymentTransactionId);
        appointment.setStatus(AppointmentStatus.UPCOMING);

        return appointmentRepository.save(appointment);

    }

    // --- Helper Methods ---

    private int calculateTotalDuration(VehicleModel model, List<String> serviceDescriptions) {
        if (serviceDescriptions == null || serviceDescriptions.isEmpty()) {
            throw new IllegalArgumentException("At least one service must be selected to calculate duration.");
        }
        int totalDuration = 0;
        for (String description : serviceDescriptions) {
            ServiceFee fee = serviceFeeRepository.findByDescriptionAndModel(description, model.getName());
            totalDuration += fee.getDurationMinutes();
        }
        return totalDuration;
    }


    private void validateAppointmentTime(LocalDate date, LocalTime startTime, LocalTime endTime) {
        if (startTime.isBefore(getWorkingStartTime()) || endTime.isAfter(getWorkingEndTime())) {
            throw new AppointmentConflictException("Requested time is outside working hours (" + getWorkingStartTime() + " - " + getWorkingEndTime() + ").");
        }

        List<Holiday> holidays = holidayRepository.findAllByDate(date);
        for (Holiday holiday : holidays) {
            LocalTime holidayStart = holiday.getStartTime() != null ? holiday.getStartTime() : LocalTime.MIN;
            LocalTime holidayEnd = holiday.getEndTime() != null ? holiday.getEndTime() : LocalTime.MAX;
            if (startTime.isBefore(holidayEnd) && endTime.isAfter(holidayStart)) {
                throw new AppointmentConflictException("The requested time period conflicts with a holiday or time-off.");
            }
        }

        if (appointmentRepository.existsOverlappingAppointment(date, startTime, endTime)) {
            throw new AppointmentConflictException("The requested time slot is no longer available.");
        }
    }

    private boolean isPhoneNumber(String identifier) {
        return identifier != null && identifier.matches("^\\d{3}-\\d{3}-\\d{4}$");
    }
    private boolean isChassisNumber(String identifier) {
        return identifier != null && identifier.length() > 10 && !isPhoneNumber(identifier);
    }

}
