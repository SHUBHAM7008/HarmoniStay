    package com.example.HarmoniStay.Backend.model;

    import org.springframework.data.annotation.CreatedDate;
    import org.springframework.data.annotation.LastModifiedDate;
    import org.springframework.data.annotation.Id;
    import org.springframework.data.mongodb.core.mapping.Document;
    import java.util.Date;
    import java.util.List;

    @Document(collection = "members")
    public class Member {

        @Id
        private String id;

        private String email;
        private String password;
        private String firstName;
        private String lastName;
        private String phone;
        private String role;
        private String status;

        private String flatId; // ✅ Flat reference

        private String profileImage;

        private EmergencyContact emergencyContact;
        private List<FamilyMember> familyMembers;

        private String dateOfJoining;
        private String resetPasswordToken;
        private String resetPasswordExpires;

        @CreatedDate
        private String createdAt;

        @LastModifiedDate
        private String updatedAt;

        // constructors, getters, setters

        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }

        public String getFirstName() {
            return firstName;
        }

        public void setFirstName(String firstName) {
            this.firstName = firstName;
        }

        public String getLastName() {
            return lastName;
        }

        public void setLastName(String lastName) {
            this.lastName = lastName;
        }

        public String getPhone() {
            return phone;
        }

        public void setPhone(String phone) {
            this.phone = phone;
        }

        public String getRole() {
            return role;
        }

        public void setRole(String role) {
            this.role = role;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public String getFlatId() {
            return flatId;
        }

        public void setFlatId(String flatId) {
            this.flatId = flatId;
        }

        public String getProfileImage() {
            return profileImage;
        }

        public void setProfileImage(String profileImage) {
            this.profileImage = profileImage;
        }

        public EmergencyContact getEmergencyContact() {
            return emergencyContact;
        }

        public void setEmergencyContact(EmergencyContact emergencyContact) {
            this.emergencyContact = emergencyContact;
        }

        public List<FamilyMember> getFamilyMembers() {
            return familyMembers;
        }

        public void setFamilyMembers(List<FamilyMember> familyMembers) {
            this.familyMembers = familyMembers;
        }

        public String getDateOfJoining() {
            return dateOfJoining;
        }

        public void setDateOfJoining(String dateOfJoining) {
            this.dateOfJoining = dateOfJoining;
        }

        public String getResetPasswordToken() {
            return resetPasswordToken;
        }

        public void setResetPasswordToken(String resetPasswordToken) {
            this.resetPasswordToken = resetPasswordToken;
        }

        public String getResetPasswordExpires() {
            return resetPasswordExpires;
        }

        public void setResetPasswordExpires(String resetPasswordExpires) {
            this.resetPasswordExpires = resetPasswordExpires;
        }

        public String getCreatedAt() {
            return createdAt;
        }

        public void setCreatedAt(String createdAt) {
            this.createdAt = createdAt;
        }

        public String getUpdatedAt() {
            return updatedAt;
        }

        public void setUpdatedAt(String updatedAt) {
            this.updatedAt = updatedAt;
        }
    }
