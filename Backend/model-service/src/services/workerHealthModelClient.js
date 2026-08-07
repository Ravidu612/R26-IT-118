import { uploadSpaceFiles } from './huggingFaceFileUploader.js'
import { callSpacePrediction } from './huggingFaceSpaceClient.js'
import { buildWearableSignalFiles } from './iot/wearableSignalFiles.js'

const fileData = (path, file) => ({
  path,
  orig_name: file.name,
  mime_type: file.mimeType,
  is_stream: false,
  meta: { _type: 'gradio.FileData' },
})

export const callWorkerHealthModel = async ({ config, readings, signals, timeoutMs }) => {
  const files = buildWearableSignalFiles({ readings, signals })
  const paths = await uploadSpaceFiles({ space: config.space, token: config.token, files, timeoutMs })
  const uploaded = Object.fromEntries(files.map((file, index) => [file.name, fileData(paths[index], file)]))
  return callSpacePrediction({
    space: config.space,
    token: config.token,
    apiUrl: config.apiUrl,
    timeoutMs,
    data: {
      v2Data: {
        feature_csv: null,
        raw_recording_zip: null,
        hr_file: uploaded['HR.csv'],
        bvp_file: uploaded['BVP.csv'],
        acc_file: uploaded['ACC.csv'],
        ibi_file: uploaded['IBI.csv'] || null,
        tags_file: null,
      },
    },
  })
}
