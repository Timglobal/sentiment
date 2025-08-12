<template>
  <Modal
    :is-open="isOpen"
    title="Add New Patient"
    size="lg"
    :icon="UserPlus"
    icon-class="bg-emerald-100"
    @close="emit('close')"
  >
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Personal Information -->
      <div>
        <h4 class="text-lg font-medium text-gray-900 mb-4">Personal Information</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="firstName" class="block text-sm font-medium text-gray-700 mb-1">
              First Name *
            </label>
            <input
              id="firstName"
              v-model="form.firstName"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Enter first name"
            />
          </div>
          <div>
            <label for="lastName" class="block text-sm font-medium text-gray-700 mb-1">
              Last Name *
            </label>
            <input
              id="lastName"
              v-model="form.lastName"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Enter last name"
            />
          </div>
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="patient@example.com"
            />
          </div>
          <div>
            <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">
              Phone Number *
            </label>
            <input
              id="phone"
              v-model="form.phone"
              type="tel"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="+1 (555) 123-4567"
            />
          </div>
          <div>
            <label for="dateOfBirth" class="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth *
            </label>
            <input
              id="dateOfBirth"
              v-model="form.dateOfBirth"
              type="date"
              required
              :max="maxBirthDate"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <div>
            <label for="gender" class="block text-sm font-medium text-gray-700 mb-1">
              Gender *
            </label>
            <select
              id="gender"
              v-model="form.gender"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Address Information -->
      <div>
        <h4 class="text-lg font-medium text-gray-900 mb-4">Address Information</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="md:col-span-2">
            <label for="address" class="block text-sm font-medium text-gray-700 mb-1">
              Street Address *
            </label>
            <input
              id="address"
              v-model="form.address"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="123 Main Street"
            />
          </div>
          <div>
            <label for="city" class="block text-sm font-medium text-gray-700 mb-1">
              City *
            </label>
            <input
              id="city"
              v-model="form.city"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Enter city"
            />
          </div>
          <div>
            <label for="zipCode" class="block text-sm font-medium text-gray-700 mb-1">
              ZIP Code *
            </label>
            <input
              id="zipCode"
              v-model="form.zipCode"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="12345"
            />
          </div>
        </div>
      </div>

      <!-- Medical Information -->
      <div>
        <h4 class="text-lg font-medium text-gray-900 mb-4">Medical Information</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="department" class="block text-sm font-medium text-gray-700 mb-1">
              Primary Department *
            </label>
            <select
              id="department"
              v-model="form.department"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">Select Department</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Neurology">Neurology</option>
              <option value="Oncology">Oncology</option>
              <option value="Pediatrics">Pediatrics</option>
              <option value="Emergency">Emergency</option>
              <option value="Surgery">Surgery</option>
              <option value="Internal Medicine">Internal Medicine</option>
              <option value="Orthopedics">Orthopedics</option>
              <option value="Dermatology">Dermatology</option>
              <option value="Psychiatry">Psychiatry</option>
            </select>
          </div>
          <div>
            <label for="bloodType" class="block text-sm font-medium text-gray-700 mb-1">
              Blood Type
            </label>
            <select
              id="bloodType"
              v-model="form.bloodType"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">Unknown</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Emergency Contact -->
      <div>
        <h4 class="text-lg font-medium text-gray-900 mb-4">Emergency Contact</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="emergencyName" class="block text-sm font-medium text-gray-700 mb-1">
              Contact Name *
            </label>
            <input
              id="emergencyName"
              v-model="form.emergencyContact.name"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Enter emergency contact name"
            />
          </div>
          <div>
            <label for="emergencyPhone" class="block text-sm font-medium text-gray-700 mb-1">
              Contact Phone *
            </label>
            <input
              id="emergencyPhone"
              v-model="form.emergencyContact.phone"
              type="tel"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="+1 (555) 123-4567"
            />
          </div>
          <div>
            <label for="emergencyRelationship" class="block text-sm font-medium text-gray-700 mb-1">
              Relationship *
            </label>
            <select
              id="emergencyRelationship"
              v-model="form.emergencyContact.relationship"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">Select Relationship</option>
              <option value="parent">Parent</option>
              <option value="spouse">Spouse</option>
              <option value="sibling">Sibling</option>
              <option value="child">Child</option>
              <option value="guardian">Guardian</option>
              <option value="friend">Friend</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label for="emergencyEmail" class="block text-sm font-medium text-gray-700 mb-1">
              Contact Email
            </label>
            <input
              id="emergencyEmail"
              v-model="form.emergencyContact.email"
              type="email"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="emergency@example.com"
            />
          </div>
        </div>
      </div>

      <!-- Medical History -->
      <div>
        <h4 class="text-lg font-medium text-gray-900 mb-4">Medical History</h4>
        <div class="space-y-4">
          <div>
            <label for="allergies" class="block text-sm font-medium text-gray-700 mb-1">
              Known Allergies
            </label>
            <textarea
              id="allergies"
              v-model="form.allergies"
              rows="2"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Enter any known allergies (medications, foods, environmental)"
            ></textarea>
          </div>
          <div>
            <label for="currentMedications" class="block text-sm font-medium text-gray-700 mb-1">
              Current Medications
            </label>
            <textarea
              id="currentMedications"
              v-model="form.currentMedications"
              rows="2"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Enter current medications (one per line)"
            ></textarea>
          </div>
          <div>
            <label for="medicalHistory" class="block text-sm font-medium text-gray-700 mb-1">
              Previous Medical History
            </label>
            <textarea
              id="medicalHistory"
              v-model="form.medicalHistory"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Enter relevant medical history, chronic conditions, previous surgeries"
            ></textarea>
          </div>
          <div>
            <label for="reasonForVisit" class="block text-sm font-medium text-gray-700 mb-1">
              Reason for Initial Visit *
            </label>
            <textarea
              id="reasonForVisit"
              v-model="form.reasonForVisit"
              rows="2"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Enter the reason for the patient's visit"
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Insurance Information -->
      <div>
        <h4 class="text-lg font-medium text-gray-900 mb-4">Insurance Information (Optional)</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="insuranceProvider" class="block text-sm font-medium text-gray-700 mb-1">
              Insurance Provider
            </label>
            <input
              id="insuranceProvider"
              v-model="form.insurance.provider"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Insurance company name"
            />
          </div>
          <div>
            <label for="insurancePolicyNumber" class="block text-sm font-medium text-gray-700 mb-1">
              Policy Number
            </label>
            <input
              id="insurancePolicyNumber"
              v-model="form.insurance.policyNumber"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Policy number"
            />
          </div>
        </div>
      </div>
    </form>

    <template #footer>
      <Button
        @click="handleSubmit"
        :disabled="isSubmitting || !isFormValid"
        class="bg-emerald-600 hover:bg-emerald-700"
      >
        <div v-if="isSubmitting" class="flex items-center">
          <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
          Adding Patient...
        </div>
        <div v-else class="flex items-center">
          <UserPlus class="w-4 h-4 mr-2" />
          Add Patient
        </div>
      </Button>
      <Button @click="emit('close')" variant="outline" class="mr-3" :disabled="isSubmitting">
        Cancel
      </Button>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'vue-toast-notification'
import Modal from '@/components/ui/Modal.vue'
import Button from '@/components/ui/Button.vue'
import { UserPlus } from 'lucide-vue-next'

interface NewPatient {
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  gender: string
  address: string
  city: string
  zipCode: string
  department: string
  bloodType: string
  emergencyContact: {
    name: string
    phone: string
    relationship: string
    email: string
  }
  allergies: string
  currentMedications: string
  medicalHistory: string
  reasonForVisit: string
  insurance: {
    provider: string
    policyNumber: string
  }
}

interface Props {
  isOpen: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  add: [patient: NewPatient]
}>()

const toast = useToast()
const isSubmitting = ref(false)
const maxBirthDate = ref('')

// Form data
const form = ref<NewPatient>({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  gender: '',
  address: '',
  city: '',
  zipCode: '',
  department: '',
  bloodType: '',
  emergencyContact: {
    name: '',
    phone: '',
    relationship: '',
    email: ''
  },
  allergies: '',
  currentMedications: '',
  medicalHistory: '',
  reasonForVisit: '',
  insurance: {
    provider: '',
    policyNumber: ''
  }
})

// Form validation
const isFormValid = computed(() => {
  return form.value.firstName.trim() &&
         form.value.lastName.trim() &&
         form.value.email.trim() &&
         form.value.phone.trim() &&
         form.value.dateOfBirth &&
         form.value.gender &&
         form.value.address.trim() &&
         form.value.city.trim() &&
         form.value.zipCode.trim() &&
         form.value.department &&
         form.value.emergencyContact.name.trim() &&
         form.value.emergencyContact.phone.trim() &&
         form.value.emergencyContact.relationship &&
         form.value.reasonForVisit.trim()
})

const handleSubmit = async () => {
  if (!isFormValid.value) return

  isSubmitting.value = true

  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))

    emit('add', form.value)
    toast.success(`Patient ${form.value.firstName} ${form.value.lastName} added successfully!`)

    // Reset form
    resetForm()
  } catch (error) {
    toast.error('Failed to add patient')
  } finally {
    isSubmitting.value = false
  }
}

const resetForm = () => {
  form.value = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    city: '',
    zipCode: '',
    department: '',
    bloodType: '',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: '',
      email: ''
    },
    allergies: '',
    currentMedications: '',
    medicalHistory: '',
    reasonForVisit: '',
    insurance: {
      provider: '',
      policyNumber: ''
    }
  }
}

// Set maximum birth date to today
onMounted(() => {
  const today = new Date()
  maxBirthDate.value = today.toISOString().split('T')[0]
})
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
